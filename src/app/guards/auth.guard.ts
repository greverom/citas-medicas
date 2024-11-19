import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { map, take } from 'rxjs';
import { selectIsLoggedIn } from '../store/user.selector';

export const authGuard: CanActivateFn = (route, state) => {
  const store = inject(Store);
  const router = inject(Router);

  return store.select(selectIsLoggedIn).pipe(
    take(1), 
    map(isLoggedIn => {
      if (isLoggedIn) {
        return true; // Permitir acceso.
      } else {
        router.navigate(['/home']); 
        return false; 
      }
    })
  );
};
