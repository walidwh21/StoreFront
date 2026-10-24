import { InjectionToken } from '@angular/core';

/**
 * Base URL of the REST API. Override it in `app.config.ts`
 * (e.g. `{ provide: API_URL, useValue: '/api' }`) for other environments.
 */
export const API_URL = new InjectionToken<string>('API_URL', {
  providedIn: 'root',
  factory: () => 'http://localhost:3000/api',
});
