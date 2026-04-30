import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/catalog/catalog.component')
        .then(m => m.CatalogComponent)
  },
  {
    path: 'product/:id',
    loadComponent: () =>
      import('./features/catalog/product-detail/product-detail.component')
        .then(m => m.ProductDetailComponent)
  },
  {
    path: 'cart',
    loadComponent: () =>
      import('./features/cart/cart.component')
        .then(m => m.CartComponent)
  },
  {
    path: 'admin',
    loadChildren: () =>
      import('./features/admin/admin.routes')
        .then(m => m.adminRoutes)
    // authGuard irá aquí en la Fase 3
  },
  {
    path: 'auth',
    loadComponent: () =>
      import('./features/auth/auth.component')
        .then(m => m.AuthComponent)
  },
  { path: '**', redirectTo: '' }
];