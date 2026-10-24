import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs';
import { UserService } from '../services/user.service';

/** Lets signed-in users through, everyone else is sent to the sign-in page. */
export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  return inject(UserService).whenSessionReady().pipe(
    map(user => (user ? true : router.createUrlTree(['/signin'])))
  );
};
