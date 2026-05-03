import { AsyncPipe, CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { TransactionFilterPanelComponent } from '../bookkeeping/shared/transaction-filter-panel/transaction-filter-panel.component';
import { TransactionFilters, TransactionTableStore } from '../bookkeeping/transaction-table.store';
import { TransactionService } from '../../core/services/transaction.service';

@Component({
  selector: 'app-transaction-list',
  standalone: true,
  providers: [TransactionTableStore],
  imports: [
    AsyncPipe,
    CommonModule,
    RouterModule,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    TransactionFilterPanelComponent
  ],
  templateUrl: './transaction-list.component.html',
  styleUrls: ['./transaction-list.component.scss']
})
export class TransactionListComponent implements OnInit {
  displayedColumns: string[] = ['date', 'type', 'category', 'currency', 'amount', 'notes', 'actions'];

  constructor(
    private transactionService: TransactionService,
    private router: Router,
    readonly tableStore: TransactionTableStore
  ) {}

  ngOnInit(): void {}

  updateFilters(filters: TransactionFilters): void {
    this.tableStore.setFilters(filters);
  }

  editTransaction(id: string): void {
    this.router.navigate(['/bookkeeping/edit', id]);
  }

  addTransaction(): void {
    this.router.navigate(['/bookkeeping/add']);
  }

  deleteTransaction(id: string): void {
    if (confirm('您確定要刪除這筆帳目嗎?')) {
      this.transactionService.deleteTransaction(id);
    }
  }
}
