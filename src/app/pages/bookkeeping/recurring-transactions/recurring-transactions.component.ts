import { CurrencyPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { TransactionIntelligenceService } from '../transaction-intelligence.service';

@Component({
  selector: 'app-recurring-transactions',
  standalone: true,
  imports: [CurrencyPipe, RouterModule, MatButtonModule, MatCardModule],
  templateUrl: './recurring-transactions.component.html',
  styleUrl: './recurring-transactions.component.scss'
})
export class RecurringTransactionsComponent {
  private readonly intelligenceService = inject(TransactionIntelligenceService);

  readonly candidates = toSignal(this.intelligenceService.getRecurringCandidates(), { initialValue: [] });
}