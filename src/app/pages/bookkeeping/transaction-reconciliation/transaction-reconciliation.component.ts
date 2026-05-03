import { AsyncPipe, CurrencyPipe, DatePipe, JsonPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { firstValueFrom } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef } from 'ag-grid-community';
import { TransactionService } from '../../../core/services/transaction.service';
import { FakeTransactionApiService } from '../fake-transaction-api.service';
import { WorkbookPreview, WorkbookToolsService } from '../workbook-tools.service';

import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';

@Component({
  selector: 'app-transaction-reconciliation',
  standalone: true,
  imports: [AsyncPipe, CurrencyPipe, DatePipe, JsonPipe, RouterModule, MatButtonModule, MatCardModule, AgGridAngular],
  templateUrl: './transaction-reconciliation.component.html',
  styleUrl: './transaction-reconciliation.component.scss'
})
export class TransactionReconciliationComponent {
  private readonly transactionApi = inject(FakeTransactionApiService);
  private readonly workbookTools = inject(WorkbookToolsService);
  private readonly transactionService = inject(TransactionService);
  private readonly refreshTick = signal(0);

  readonly vm$ = toObservable(this.refreshTick).pipe(
    switchMap(() => this.transactionApi.getReconciliationVm({
      groupBy: 'category',
      sortBy: 'amount',
      sortDirection: 'desc',
      minAmount: 100
    }))
  );
  readonly importSummary = signal<WorkbookPreview | null>(null);
  readonly importMessage = signal('尚未匯入對帳工作簿');
  readonly groupColumnDefs: ColDef[] = [
    { field: 'label', headerName: '分組', flex: 1.3 },
    { field: 'count', headerName: '筆數', width: 100 },
    { field: 'income', headerName: '收入', width: 130, valueFormatter: params => this.formatCurrency(params.value) },
    { field: 'expense', headerName: '支出', width: 130, valueFormatter: params => this.formatCurrency(params.value) },
    { field: 'net', headerName: '淨額', width: 130, valueFormatter: params => this.formatCurrency(params.value) }
  ];
  readonly anomalyColumnDefs: ColDef[] = [
    { field: 'date', headerName: '日期', width: 120 },
    { field: 'category', headerName: '分類', flex: 1.2 },
    { field: 'type', headerName: '類型', width: 110 },
    { field: 'amount', headerName: '金額', width: 130, valueFormatter: params => this.formatCurrency(params.value, params.data?.currency) },
    { field: 'currency', headerName: '幣別', width: 100 },
    { field: 'notes', headerName: '備註', flex: 1.5 }
  ];
  readonly defaultColDef: ColDef = {
    sortable: true,
    filter: true,
    resizable: true
  };

  async exportWorkbook(): Promise<void> {
    const vm = await firstValueFrom(this.vm$);

    this.workbookTools.exportWorkbook('bookkeeping-reconciliation.xlsx', {
      groups: vm.groups.map(group => ({
        label: group.label,
        count: group.count,
        income: group.income,
        expense: group.expense,
        net: group.net
      })),
      anomalies: vm.anomalies.map(item => ({
        id: item.id,
        type: item.type,
        category: item.category,
        amount: item.amount,
        currency: item.currency,
        date: item.date,
        notes: item.notes ?? ''
      })),
      exportDraft: vm.exportDraft.previewRows
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
    this.importMessage.set(`已分析 ${imported.preview.fileName}，回寫 ${imported.transactions.length} 筆交易。`);
    input.value = '';
  }

  private formatCurrency(value: unknown, currency: string = 'TWD'): string {
    const amount = typeof value === 'number' ? value : Number(value ?? 0);
    return new Intl.NumberFormat('zh-TW', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0
    }).format(Number.isFinite(amount) ? amount : 0);
  }
}