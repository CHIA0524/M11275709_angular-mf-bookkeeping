import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { compareAsc, format, parseISO } from 'date-fns';
import Fuse from 'fuse.js';
import { Observable, delay, map, of } from 'rxjs';
import { z } from 'zod';
import { Transaction } from '../../core/services/transaction.service';

const transactionSchema = z.object({
  id: z.string(),
  type: z.enum(['income', 'expense']),
  category: z.string(),
  amount: z.number(),
  currency: z.string(),
  date: z.string(),
  notes: z.string().optional()
});

const transactionQuerySchema = z.object({
  keyword: z.string(),
  type: z.enum(['all', 'income', 'expense']),
  currency: z.string(),
  minAmount: z.number().nullable(),
  groupBy: z.enum(['category', 'currency', 'month']),
  sortBy: z.enum(['date', 'amount', 'category']),
  sortDirection: z.enum(['asc', 'desc'])
});

export interface TransactionApiQuery {
  keyword: string;
  type: 'all' | Transaction['type'];
  currency: 'all' | string;
  minAmount: number | null;
  groupBy: 'category' | 'currency' | 'month';
  sortBy: 'date' | 'amount' | 'category';
  sortDirection: 'asc' | 'desc';
}

export interface TransactionApiMeta {
  source: 'local-storage' | 'mock-json';
  fetchedAt: string;
  latencyMs: number;
  totalAvailable: number;
  returnedCount: number;
}

export interface TransactionGroupSummary {
  key: string;
  label: string;
  count: number;
  income: number;
  expense: number;
  net: number;
}

export interface TransactionApiResponse {
  items: Transaction[];
  currencies: string[];
  groups: TransactionGroupSummary[];
  meta: TransactionApiMeta;
  query: TransactionApiQuery;
}

export interface TransactionExportDraft {
  generatedAt: string;
  filters: TransactionApiQuery;
  totals: {
    income: number;
    expense: number;
    net: number;
  };
  previewRows: Array<{
    id: string;
    category: string;
    amount: number;
    currency: string;
    date: string;
    risk: 'low' | 'medium' | 'high';
  }>;
}

export interface TransactionReconciliationVm {
  meta: TransactionApiMeta;
  totals: {
    income: number;
    expense: number;
    net: number;
  };
  groups: TransactionGroupSummary[];
  anomalies: Transaction[];
  exportDraft: TransactionExportDraft;
}

@Injectable({ providedIn: 'root' })
export class FakeTransactionApiService {
  private readonly http = inject(HttpClient);
  private readonly storageKey = 'transactions';

  readonly defaultQuery: TransactionApiQuery = {
    keyword: '',
    type: 'all',
    currency: 'all',
    minAmount: null,
    groupBy: 'category',
    sortBy: 'date',
    sortDirection: 'desc'
  };

  getTransactions(query: Partial<TransactionApiQuery> = {}): Observable<TransactionApiResponse> {
    const normalizedQuery = transactionQuerySchema.parse({
      ...this.defaultQuery,
      ...query
    });

    return this.readSnapshot().pipe(
      map(({ source, latencyMs, transactions }) => {
        const items = this.applyQuery(transactions, normalizedQuery);
        const groups = this.buildGroups(items, normalizedQuery.groupBy);
        return {
          items,
          groups,
          currencies: [...new Set(transactions.map(transaction => transaction.currency))].sort(),
          meta: {
            source,
            fetchedAt: new Date().toISOString(),
            latencyMs,
            totalAvailable: transactions.length,
            returnedCount: items.length
          },
          query: normalizedQuery
        };
      })
    );
  }

  getReconciliationVm(query: Partial<TransactionApiQuery> = {}): Observable<TransactionReconciliationVm> {
    return this.getTransactions(query).pipe(
      map(response => {
        const totals = response.items.reduce(
          (result, transaction) => ({
            income: result.income + (transaction.type === 'income' ? transaction.amount : 0),
            expense: result.expense + (transaction.type === 'expense' ? transaction.amount : 0),
            net: result.net + (transaction.type === 'income' ? transaction.amount : -transaction.amount)
          }),
          { income: 0, expense: 0, net: 0 }
        );

        const averageExpense = response.items
          .filter(transaction => transaction.type === 'expense')
          .reduce((sum, transaction, _, array) => sum + transaction.amount / (array.length || 1), 0);

        const anomalies = response.items.filter(transaction => {
          const highExpense = transaction.type === 'expense' && transaction.amount >= averageExpense * 1.75;
          const missingNotes = !transaction.notes?.trim();
          return highExpense || missingNotes;
        }).slice(0, 6);

        return {
          meta: response.meta,
          totals,
          groups: response.groups,
          anomalies,
          exportDraft: {
            generatedAt: response.meta.fetchedAt,
            filters: response.query,
            totals,
            previewRows: response.items.slice(0, 5).map(transaction => ({
              id: transaction.id,
              category: transaction.category,
              amount: transaction.amount,
              currency: transaction.currency,
              date: transaction.date,
              risk: transaction.amount >= averageExpense * 1.75 ? 'high' : transaction.type === 'expense' ? 'medium' : 'low'
            }))
          }
        };
      })
    );
  }

  private readSnapshot(): Observable<{ source: 'local-storage' | 'mock-json'; latencyMs: number; transactions: Transaction[] }> {
    const storedTransactions = localStorage.getItem(this.storageKey);

    if (storedTransactions) {
      return of(storedTransactions).pipe(
        delay(140),
        map(payload => ({
          source: 'local-storage' as const,
          latencyMs: 140,
          transactions: this.parseTransactions(JSON.parse(payload))
        }))
      );
    }

    return this.http.get<Transaction[]>('assets/mock/transaction/transactions.json').pipe(
      delay(260),
      map(transactions => ({
        source: 'mock-json' as const,
        latencyMs: 260,
        transactions: this.parseTransactions(transactions)
      }))
    );
  }

  private parseTransactions(input: unknown): Transaction[] {
    return z.array(transactionSchema).parse(input).map(transaction => ({
      ...transaction,
      currency: transaction.currency || 'TWD'
    }));
  }

  private applyQuery(transactions: Transaction[], query: TransactionApiQuery): Transaction[] {
    const keywordMatches = !query.keyword.trim()
      ? transactions
      : new Fuse(transactions, {
          keys: ['category', 'notes', 'currency'],
          threshold: 0.35,
          ignoreLocation: true
        })
          .search(query.keyword)
          .map(result => result.item);

    const filtered = keywordMatches.filter(transaction => {
      const matchesType = query.type === 'all' || transaction.type === query.type;
      const matchesCurrency = query.currency === 'all' || transaction.currency === query.currency;
      const matchesAmount = query.minAmount === null || transaction.amount >= query.minAmount;
      return matchesType && matchesCurrency && matchesAmount;
    });

    return [...filtered].sort((left, right) => this.sortTransactions(left, right, query));
  }

  private sortTransactions(left: Transaction, right: Transaction, query: TransactionApiQuery): number {
    const baseCompare = (() => {
      switch (query.sortBy) {
        case 'amount':
          return left.amount - right.amount;
        case 'category':
          return left.category.localeCompare(right.category, 'zh-Hant');
        case 'date':
        default:
          return compareAsc(parseISO(left.date), parseISO(right.date));
      }
    })();

    return query.sortDirection === 'asc' ? baseCompare : -baseCompare;
  }

  private buildGroups(transactions: Transaction[], groupBy: TransactionApiQuery['groupBy']): TransactionGroupSummary[] {
    const grouped = transactions.reduce<Record<string, Transaction[]>>((result, transaction) => {
      const key = groupBy === 'month'
        ? format(parseISO(transaction.date), 'yyyy/MM')
        : groupBy === 'currency'
          ? transaction.currency
          : transaction.category;
      result[key] = [...(result[key] ?? []), transaction];
      return result;
    }, {});

    return Object.entries(grouped)
      .map(([key, items]) => ({
        key,
        label: key,
        count: items.length,
        income: items.filter(item => item.type === 'income').reduce((sum, item) => sum + item.amount, 0),
        expense: items.filter(item => item.type === 'expense').reduce((sum, item) => sum + item.amount, 0),
        net: items.reduce((sum, item) => sum + (item.type === 'income' ? item.amount : -item.amount), 0)
      }))
      .sort((left, right) => right.count - left.count || right.net - left.net);
  }
}