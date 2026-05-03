import { AsyncPipe, CurrencyPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { TransactionIntelligenceService } from '../transaction-intelligence.service';

@Component({
  selector: 'app-recurring-transactions',
  standalone: true,
  imports: [AsyncPipe, CurrencyPipe, RouterModule, MatButtonModule, MatCardModule],
  templateUrl: './recurring-transactions.component.html',
  styleUrl: './recurring-transactions.component.scss'
})
export class RecurringTransactionsComponent {
  private readonly intelligenceService = inject(TransactionIntelligenceService);

  readonly candidates$ = this.intelligenceService.getRecurringCandidates();
}