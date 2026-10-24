import { RenderMode, ServerRoute } from '@angular/ssr';

/**
 * Public, static pages are prerendered. Pages that depend on the signed-in user
 * or on route parameters are rendered per request.
 */
export const serverRoutes: ServerRoute[] = [
  { path: '', renderMode: RenderMode.Prerender },
  { path: 'catalog', renderMode: RenderMode.Prerender },
  { path: 'signin', renderMode: RenderMode.Prerender },
  { path: 'signup', renderMode: RenderMode.Prerender },
  { path: 'shopping-cart', renderMode: RenderMode.Prerender },
  { path: 'product-details/:id', renderMode: RenderMode.Server },
  { path: '**', renderMode: RenderMode.Server },
];
