import { Injectable, inject } from '@angular/core';
import Fuse from 'fuse.js';
import { endOfMonth, format, parseISO, startOfMonth } from 'date-fns';
import { Observable, map } from 'rxjs';
import { z } from 'zod';
import { Transaction } from '../../core/services/transaction.service';
import { FakeTransactionApiService } from './fake-transaction-api.service';

const transactionSchema = z.object({
  id: z.string(),
  type: z.enum(['income', 'expense']),
  category: z.string(),
  amount: z.number(),
  currency: z.string(),
  date: z.string(),
  notes: z.string().optional()
});

export interface TransactionAnalyticsVm {
  monthlyIncome: number;
  monthlyExpense: number;
  topExpenseCategory: string;
  topKeywordMatches: Transaction[];
  dateRangeLabel: string;
}

export interface RecurringCandidate {
  category: string;
  averageAmount: number;
  occurrences: number;
  latestDate: string;
}

@Injectable({ providedIn: 'root' })
export class TransactionIntelligenceService {
  private readonly transactionApi = inject(FakeTransactionApiService);

  getAnalytics(keyword = '轉帳'): Observable<TransactionAnalyticsVm> {
    return this.transactionApi.getTransactions({ sortBy: 'amount', sortDirection: 'desc' }).pipe(
      map(response => z.array(transactionSchema).parse(response.items)),
      map(transactions => this.buildAnalytics(transactions, keyword))
    );
  }

  getRecurringCandidates(): Observable<RecurringCandidate[]> {
    return this.transactionApi.getTransactions({ groupBy: 'category' }).pipe(
      map(response => z.array(transactionSchema).parse(response.items)),
      map(transactions => {
        const grouped = transactions.reduce<Record<string, Transaction[]>>((result, transaction) => {
          result[transaction.category] = [...(result[transaction.category] ?? []), transaction];
          return result;
        }, {});

        return Object.entries(grouped)
          .filter(([, items]) => items.length >= 2)
          .map(([category, items]) => ({
            category,
            averageAmount: Math.round(items.reduce((sum, item) => sum + item.amount, 0) / items.length),
            occurrences: items.length,
            latestDate: [...items].sort((left, right) => right.date.localeCompare(left.date))[0].date
          }))
          .sort((left, right) => right.occurrences - left.occurrences);
      })
    );
  }

  private buildAnalytics(transactions: Transaction[], keyword: string): TransactionAnalyticsVm {
    const thisMonthTransactions = transactions.filter(transaction => {
      const date = parseISO(transaction.date);
      const now = new Date();
      return date >= startOfMonth(now) && date <= endOfMonth(now);
    });
    const monthlyIncome = thisMonthTransactions.filter(item => item.type === 'income').reduce((sum, item) => sum + item.amount, 0);
    const monthlyExpense = thisMonthTransactions.filter(item => item.type === 'expense').reduce((sum, item) => sum + item.amount, 0);

    const expenseByCategory = thisMonthTransactions
      .filter(item => item.type === 'expense')
      .reduce<Record<string, number>>((result, item) => {
        result[item.category] = (result[item.category] ?? 0) + item.amount;
        return result;
      }, {});

    const [topExpenseCategory = '無資料'] = Object.entries(expenseByCategory).sort((left, right) => right[1] - left[1])[0] ?? [];
    const fuse = new Fuse(transactions, { keys: ['category', 'notes'], threshold: 0.3 });
    const topKeywordMatches = fuse.search(keyword).slice(0, 5).map(result => result.item);

    return {
      monthlyIncome,
      monthlyExpense,
      topExpenseCategory,
      topKeywordMatches,
      dateRangeLabel: `${format(startOfMonth(new Date()), 'yyyy/MM/dd')} - ${format(endOfMonth(new Date()), 'yyyy/MM/dd')}`
    };
  }
}