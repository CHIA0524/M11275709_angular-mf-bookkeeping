import { Component, EventEmitter, OnInit, Output, inject, input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { TransactionFilters } from '../../transaction-table.store';

@Component({
  selector: 'app-transaction-filter-panel',
  standalone: true,
  imports: [FormsModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatSelectModule],
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