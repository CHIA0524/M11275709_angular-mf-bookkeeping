import { CurrencyPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { TransactionIntelligenceService } from '../transaction-intelligence.service';

@Component({
  selector: 'app-transaction-analytics',
  standalone: true,
  imports: [CurrencyPipe, RouterModule, MatButtonModule, MatCardModule],
  templateUrl: './transaction-analytics.component.html',
  styleUrl: './transaction-analytics.component.scss'
})
export class TransactionAnalyticsComponent {
  private readonly intelligenceService = inject(TransactionIntelligenceService);

  readonly analytics = toSignal(this.intelligenceService.getAnalytics());
}