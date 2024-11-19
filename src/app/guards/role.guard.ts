import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { selectUserData } from '../store/user.selector';
import { map, take } from 'rxjs';

export const roleGuard: CanActivateFn = (route, state) => {
  const store = inject(Store);
  const router = inject(Router);

  const expectedRole = route.data?.['role']; 

  return store.select(selectUserData).pipe(
    take(1),
    map(user => {
      if (user?.role === expectedRole) {
        return true; // Permitir acceso.
      } else {
        router.navigate(['/home']); 
        return false; 
      }
    })
  );
};
