import { Routes } from '@angular/router';

export const routes: Routes = [
	{
		path: '',
		loadComponent: () => import('./pages/transaction-list.component').then((m) => m.TransactionListComponent)
	},
	{
		path: 'add',
		loadComponent: () => import('./pages/quick-add/quick-add.component').then((m) => m.QuickAddComponent)
	},
	{
		path: 'edit/:id',
		loadComponent: () => import('./pages/quick-add/quick-add.component').then((m) => m.QuickAddComponent)
	}
];
