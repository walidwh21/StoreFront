import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { API_URL } from '../config/api.config';

/** Sends the session cookie with every request that targets our own API. */
export const credentialsInterceptor: HttpInterceptorFn = (req, next) => {
  const apiUrl = inject(API_URL);
  return req.url.startsWith(apiUrl) ? next(req.clone({ withCredentials: true })) : next(req);
};
