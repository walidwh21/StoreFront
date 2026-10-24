import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs';
import { UserService } from '../services/user.service';
import { UserType } from '../models/user.model';

/** Restricts a route to administrators. */
export const adminGuard: CanActivateFn = () => {
  const router = inject(Router);
  return inject(UserService).whenSessionReady().pipe(
    map(user => (user?.getUserType() === UserType.Admin ? true : router.createUrlTree(['/catalog'])))
  );
};
