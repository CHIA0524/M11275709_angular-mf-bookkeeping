import { Routes } from '@angular/router';

export const benchmarkRoutes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'benchmark-case-001'
  },
  {
    path: 'benchmark-case-001',
    loadComponent: () => import('./generated/benchmark-case-001.component').then((m) => m.BenchmarkCase001Component)
  },
  {
    path: 'benchmark-case-002',
    loadComponent: () => import('./generated/benchmark-case-002.component').then((m) => m.BenchmarkCase002Component)
  },
  {
    path: 'benchmark-case-003',
    loadComponent: () => import('./generated/benchmark-case-003.component').then((m) => m.BenchmarkCase003Component)
  },
  {
    path: 'benchmark-case-004',
    loadComponent: () => import('./generated/benchmark-case-004.component').then((m) => m.BenchmarkCase004Component)
  },
  {
    path: 'benchmark-case-005',
    loadComponent: () => import('./generated/benchmark-case-005.component').then((m) => m.BenchmarkCase005Component)
  },
  {
    path: 'benchmark-case-006',
    loadComponent: () => import('./generated/benchmark-case-006.component').then((m) => m.BenchmarkCase006Component)
  },
  {
    path: 'benchmark-case-007',
    loadComponent: () => import('./generated/benchmark-case-007.component').then((m) => m.BenchmarkCase007Component)
  },
  {
    path: 'benchmark-case-008',
    loadComponent: () => import('./generated/benchmark-case-008.component').then((m) => m.BenchmarkCase008Component)
  },
  {
    path: 'benchmark-case-009',
    loadComponent: () => import('./generated/benchmark-case-009.component').then((m) => m.BenchmarkCase009Component)
  },
  {
    path: 'benchmark-case-010',
    loadComponent: () => import('./generated/benchmark-case-010.component').then((m) => m.BenchmarkCase010Component)
  },
  {
    path: 'benchmark-case-011',
    loadComponent: () => import('./generated/benchmark-case-011.component').then((m) => m.BenchmarkCase011Component)
  },
  {
    path: 'benchmark-case-012',
    loadComponent: () => import('./generated/benchmark-case-012.component').then((m) => m.BenchmarkCase012Component)
  },
  {
    path: 'benchmark-case-013',
    loadComponent: () => import('./generated/benchmark-case-013.component').then((m) => m.BenchmarkCase013Component)
  },
  {
    path: 'benchmark-case-014',
    loadComponent: () => import('./generated/benchmark-case-014.component').then((m) => m.BenchmarkCase014Component)
  },
  {
    path: 'benchmark-case-015',
    loadComponent: () => import('./generated/benchmark-case-015.component').then((m) => m.BenchmarkCase015Component)
  },
  {
    path: 'benchmark-case-016',
    loadComponent: () => import('./generated/benchmark-case-016.component').then((m) => m.BenchmarkCase016Component)
  },
  {
    path: 'benchmark-case-017',
    loadComponent: () => import('./generated/benchmark-case-017.component').then((m) => m.BenchmarkCase017Component)
  },
  {
    path: 'benchmark-case-018',
    loadComponent: () => import('./generated/benchmark-case-018.component').then((m) => m.BenchmarkCase018Component)
  }
];
