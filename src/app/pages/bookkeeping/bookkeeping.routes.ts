import { Routes } from '@angular/router';

export const bookkeepingRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('../transaction-list/transaction-list.component').then(m => m.TransactionListComponent)
  },
  {
    path: 'add',
    loadComponent: () => import('../quick-add/quick-add.component').then(m => m.QuickAddComponent)
  },
  {
    path: 'edit/:id',
    loadComponent: () => import('../quick-add/quick-add.component').then(m => m.QuickAddComponent)
  },
  {
    path: 'analytics',
    loadComponent: () => import('./transaction-analytics/transaction-analytics.component').then(m => m.TransactionAnalyticsComponent)
  },
  {
    path: 'recurring',
    loadComponent: () => import('./recurring-transactions/recurring-transactions.component').then(m => m.RecurringTransactionsComponent)
  },
  {
    path: 'review',
    loadComponent: () => import('./transaction-review/transaction-review.component').then(m => m.TransactionReviewComponent)
  },
  {
    path: 'reconciliation',
    loadComponent: () => import('./transaction-reconciliation/transaction-reconciliation.component').then(m => m.TransactionReconciliationComponent)
  }
];