import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';

/** All feature pages are lazy-loaded to keep the initial bundle small. */
export const routes: Routes = [
  {
    path: 'catalog',
    title: 'Products Catalog',
    loadComponent: () => import('./features/catalog/catalog.component').then(m => m.CatalogComponent),
  },
  {
    path: 'product-details/:id',
    title: 'Product details',
    loadComponent: () =>
      import('./features/product-details/product-details.component').then(m => m.ProductDetailsComponent),
  },
  {
    path: 'shopping-cart',
    title: 'Shopping cart',
    loadComponent: () =>
      import('./features/cart/shopping-cart.component').then(m => m.ShoppingCartComponent),
  },
  {
    path: 'signin',
    title: 'Sign in',
    loadComponent: () => import('./features/auth/signin/signin.component').then(m => m.SigninComponent),
  },
  {
    path: 'signup',
    title: 'Sign up',
    loadComponent: () => import('./features/auth/signup/signup.component').then(m => m.SignupComponent),
  },

  // ---- signed-in users
  {
    path: 'profile',
    title: 'Profile',
    canActivate: [authGuard],
    loadComponent: () => import('./features/profile/profile.component').then(m => m.ProfileComponent),
  },
  {
    path: 'order-page',
    title: 'Checkout',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/checkout/order-page.component').then(m => m.OrderPageComponent),
  },
  {
    path: 'order-details/:id',
    title: 'Order details',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/orders/order-details.component').then(m => m.OrderDetailsComponent),
  },

  // ---- administrators only
  {
    path: 'stock-monitoring',
    title: 'Stock monitoring',
    canActivate: [authGuard, adminGuard],
    loadComponent: () =>
      import('./features/admin/stock-monitoring/stock-monitoring.component').then(
        m => m.StockMonitoringComponent
      ),
  },
  {
    path: 'offers',
    title: 'Offer management',
    canActivate: [authGuard, adminGuard],
    loadComponent: () =>
      import('./features/admin/offer-management/offer-management.component').then(
        m => m.OfferManagementComponent
      ),
  },
  {
    path: 'user-management',
    title: 'User management',
    canActivate: [authGuard, adminGuard],
    loadComponent: () =>
      import('./features/admin/user-management/user-management.component').then(
        m => m.UserManagementComponent
      ),
  },

  { path: '', redirectTo: 'catalog', pathMatch: 'full' },
  { path: '**', redirectTo: 'catalog' },
];
