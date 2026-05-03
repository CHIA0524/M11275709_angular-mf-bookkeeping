import { Injectable, inject } from '@angular/core';
import { ComponentStore } from '@ngrx/component-store';
import { map, switchMap } from 'rxjs/operators';
import { Transaction } from '../../core/services/transaction.service';
import { FakeTransactionApiService } from './fake-transaction-api.service';

export interface TransactionFilters {
  keyword: string;
  type: 'all' | Transaction['type'];
  currency: 'all' | string;
  minAmount: number | null;
  groupBy: 'category' | 'currency' | 'month';
  sortBy: 'date' | 'amount' | 'category';
  sortDirection: 'asc' | 'desc';
}

interface TransactionTableState {
  filters: TransactionFilters;
}

@Injectable()
export class TransactionTableStore extends ComponentStore<TransactionTableState> {
  private readonly transactionApi = inject(FakeTransactionApiService);

  readonly filters$ = this.select(state => state.filters);
  readonly vm$ = this.filters$.pipe(
    switchMap(filters => this.transactionApi.getTransactions(filters)),
    map(response => {
      const totals = response.items.reduce((result, transaction) => ({
        income: result.income + (transaction.type === 'income' ? transaction.amount : 0),
        expense: result.expense + (transaction.type === 'expense' ? transaction.amount : 0)
      }), { income: 0, expense: 0 });

      return {
        transactions: response.items,
        totals,
        currencies: response.currencies,
        groupPreview: response.groups.slice(0, 3),
        meta: response.meta
      };
    })
  );

  constructor() {
    super({
      filters: {
        keyword: '',
        type: 'all',
        currency: 'all',
        minAmount: null,
        groupBy: 'category',
        sortBy: 'date',
        sortDirection: 'desc'
      }
    });
  }

  readonly setFilters = this.updater((state, filters: TransactionFilters) => ({
    ...state,
    filters
  }));
}
