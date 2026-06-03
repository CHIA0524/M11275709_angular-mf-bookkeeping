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
import { FeatureActionItem, FeatureActionStripComponent } from '../../shared/ui/feature-action-strip.component';
import { InfoPillItem, InfoPillsComponent } from '../../shared/ui/info-pills.component';
import { LanguageService } from '../../core/services/language.service';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

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
    TransactionFilterPanelComponent,
    FeatureActionStripComponent,
    InfoPillsComponent,
    TranslatePipe
  ],
  templateUrl: './transaction-list.component.html',
  styleUrls: ['./transaction-list.component.scss']
})
export class TransactionListComponent implements OnInit {
  readonly bookkeepingActions: FeatureActionItem[] = [
    { label: '分析頁', icon: 'query_stats', routerLink: '/bookkeeping/analytics', tone: 'accent' },
    { label: '重複交易', icon: 'repeat', routerLink: '/bookkeeping/recurring' },
    { label: '審核頁', icon: 'fact_check', routerLink: '/bookkeeping/review' },
    { label: '對帳頁', icon: 'account_tree', routerLink: '/bookkeeping/reconciliation' }
  ];

  readonly bookkeepingHighlights: InfoPillItem[] = [
    { label: '資料來源', value: '本機交易服務', icon: 'storage', tone: 'accent' },
    { label: '檢查模式', value: '支援審核與對帳', icon: 'rule', tone: 'success' },
    { label: '匯入能力', value: '可搭配 XLSX 流程', icon: 'upload_file', tone: 'warning' }
  ];

  displayedColumns: string[] = ['date', 'type', 'category', 'currency', 'amount', 'notes', 'actions'];

  constructor(
    private transactionService: TransactionService,
    private router: Router,
    private languageService: LanguageService,
    readonly tableStore: TransactionTableStore
  ) {}

  ngOnInit(): void {  
    console.log('test')
  }

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
    if (confirm(this.languageService.translate('您確定要刪除這筆帳目嗎?'))) {
      this.transactionService.deleteTransaction(id);
    }
  }
}
