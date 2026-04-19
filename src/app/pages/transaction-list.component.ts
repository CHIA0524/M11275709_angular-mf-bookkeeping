import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Observable } from 'rxjs';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { TransactionService, Transaction } from '../core/services/transaction.service';

@Component({
  selector: 'app-transaction-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule
  ],
  templateUrl: './transaction-list.component.html',
  styleUrls: ['./transaction-list.component.scss']
})
export class TransactionListComponent implements OnInit {
  transactions$: Observable<Transaction[]>;
  displayedColumns: string[] = ['date', 'type', 'category', 'currency', 'amount', 'notes', 'actions'];

  constructor(
    private transactionService: TransactionService,
    private router: Router
  ) {
    this.transactions$ = this.transactionService.getTransactions();
  }

  ngOnInit(): void {}

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
