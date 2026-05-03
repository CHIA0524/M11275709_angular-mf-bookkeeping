import { AsyncPipe, CurrencyPipe, JsonPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { firstValueFrom } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { TransactionService } from '../../../core/services/transaction.service';
import { TransactionIntelligenceService } from '../transaction-intelligence.service';
import { WorkbookPreview, WorkbookToolsService } from '../workbook-tools.service';

@Component({
  selector: 'app-transaction-review',
  standalone: true,
  imports: [AsyncPipe, CurrencyPipe, JsonPipe, RouterModule, MatButtonModule, MatCardModule],
  templateUrl: './transaction-review.component.html',
  styleUrl: './transaction-review.component.scss'
})
export class TransactionReviewComponent {
  private readonly intelligenceService = inject(TransactionIntelligenceService);
  private readonly workbookTools = inject(WorkbookToolsService);
  private readonly transactionService = inject(TransactionService);
  private readonly refreshTick = signal(0);

  readonly analytics$ = toObservable(this.refreshTick).pipe(
    switchMap(() => this.intelligenceService.getAnalytics('收入'))
  );
  readonly recurring$ = toObservable(this.refreshTick).pipe(
    switchMap(() => this.intelligenceService.getRecurringCandidates())
  );
  readonly importSummary = signal<WorkbookPreview | null>(null);
  readonly importMessage = signal('尚未匯入 Excel');

  async exportReviewWorkbook(): Promise<void> {
    const analytics = await firstValueFrom(this.analytics$);
    const recurring = await firstValueFrom(this.recurring$);

    this.workbookTools.exportWorkbook('bookkeeping-review.xlsx', {
      summary: analytics
        ? [
            {
              monthlyIncome: analytics.monthlyIncome,
              monthlyExpense: analytics.monthlyExpense,
              topExpenseCategory: analytics.topExpenseCategory
            }
          ]
        : [],
      recurring: recurring.map(item => ({
        category: item.category,
        latestDate: item.latestDate,
        occurrences: item.occurrences,
        averageAmount: item.averageAmount
      })),
      importedPreview: this.importSummary()?.previewRows ?? []
    });
  }

  async importWorkbook(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      return;
    }

    const imported = await this.workbookTools.parseTransactionWorkbook(file);
    this.importSummary.set(imported.preview);
    this.transactionService.replaceTransactions(imported.transactions);
    this.refreshTick.update(value => value + 1);
    this.importMessage.set(`已讀取 ${imported.preview.fileName}，寫入 ${imported.transactions.length} 筆交易。`);
    input.value = '';
  }
}