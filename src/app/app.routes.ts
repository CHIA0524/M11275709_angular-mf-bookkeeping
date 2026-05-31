import { Routes } from '@angular/router';

export const routes: Routes = [
	{
		path: '',
		loadChildren: () => import('./pages/bookkeeping/bookkeeping.routes').then((m) => m.bookkeepingRoutes)
	}
];
