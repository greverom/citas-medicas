import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { map, Observable } from 'rxjs';
import { selectIsLoggedIn, selectUserData } from '../../store/user.selector';
import { setLoggedInStatus, unsetUserData } from '../../store/user.action';
import { CommonModule } from '@angular/common';
import { UserRole } from '../../models/user.dto';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    RouterModule,
    CommonModule
  ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  isLoggedIn$: Observable<boolean>;
  isAdmin$: Observable<boolean>;
  isMedico$: Observable<boolean>;
  isPaciente$: Observable<boolean>;

  constructor(private store: Store, private router: Router) {
    this.isLoggedIn$ = this.store.select(selectIsLoggedIn);
    this.isAdmin$ = this.store.select(selectUserData).pipe(
      map(user => user?.role === UserRole.Admin)
    );
    this.isMedico$ = this.store.select(selectUserData).pipe(
      map(user => user?.role === UserRole.Medico)
    );
    this.isPaciente$ = this.store.select(selectUserData).pipe(
      map(user => user?.role === UserRole.Paciente)
    );
  }

  logout() {
    this.store.dispatch(setLoggedInStatus({ isLoggedIn: false }));
    this.store.dispatch(unsetUserData());
    localStorage.removeItem('accessToken');
    this.router.navigate(['/login']);
  }
}
