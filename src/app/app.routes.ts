import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/catalog/catalog')
        .then(m => m.CatalogComponent)
  },
  {
    path: 'cart',
    loadComponent: () =>
      import('./features/cart/cart')
        .then(m => m.CartComponent)
  },
  {
    path: 'admin',
    loadChildren: () =>
      import('./features/admin/admin.routes')
        .then(m => m.adminRoutes)
  },
  {
    path: 'auth',
    loadComponent: () =>
      import('./features/auth/auth')
        .then(m => Object.values(m)[0] as any)
  },
  { path: '**', redirectTo: '' }
];