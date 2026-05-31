import { Component, EventEmitter, OnInit, Output, inject, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { TransactionFilters } from '../../transaction-table.store';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-transaction-filter-panel',
  standalone: true,
  imports: [MatButtonModule, MatFormFieldModule, MatInputModule, MatSelectModule, TranslatePipe],
  templateUrl: './transaction-filter-panel.component.html',
  styleUrl: './transaction-filter-panel.component.scss'
})
export class TransactionFilterPanelComponent implements OnInit {
  readonly currencies = input<string[]>([]);
  @Output() readonly filtersChange = new EventEmitter<TransactionFilters>();

  keyword = '';
  type: TransactionFilters['type'] = 'all';
  currency: TransactionFilters['currency'] = 'all';
  minAmount: number | null = null;
  groupBy: TransactionFilters['groupBy'] = 'category';
  sortBy: TransactionFilters['sortBy'] = 'date';
  sortDirection: TransactionFilters['sortDirection'] = 'desc';

  ngOnInit(): void {
    this.emitFilters();
  }

  updateKeyword(value: string): void {
    this.keyword = value;
    this.emitFilters();
  }

  updateType(value: TransactionFilters['type']): void {
    this.type = value;
    this.emitFilters();
  }

  updateCurrency(value: TransactionFilters['currency']): void {
    this.currency = value;
    this.emitFilters();
  }

  updateMinAmount(value: string): void {
    this.minAmount = value === '' ? null : Number(value);
    this.emitFilters();
  }

  updateSortBy(value: TransactionFilters['sortBy']): void {
    this.sortBy = value;
    this.emitFilters();
  }

  updateSortDirection(value: TransactionFilters['sortDirection']): void {
    this.sortDirection = value;
    this.emitFilters();
  }

  updateGroupBy(value: TransactionFilters['groupBy']): void {
    this.groupBy = value;
    this.emitFilters();
  }

  emitFilters(): void {
    this.filtersChange.emit({
      keyword: this.keyword,
      type: this.type,
      currency: this.currency,
      minAmount: this.minAmount,
      groupBy: this.groupBy,
      sortBy: this.sortBy,
      sortDirection: this.sortDirection
    });
  }

  reset(): void {
    this.keyword = '';
    this.type = 'all';
    this.currency = 'all';
    this.minAmount = null;
    this.groupBy = 'category';
    this.sortBy = 'date';
    this.sortDirection = 'desc';
    this.emitFilters();
  }
}