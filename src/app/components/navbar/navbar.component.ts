import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { map, Observable } from 'rxjs';
import { selectIsLoggedIn, selectUserData } from '../../store/user.selector';
import { setLoggedInStatus, unsetUserData } from '../../store/user.action';
import { CommonModule } from '@angular/common';
import { UserRole } from '../../models/user.dto';
import { AuthService } from '../../services/auth.service';

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

  constructor(private store: Store, 
              private router: Router, 
              private authService: AuthService) {
                
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
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/home']);
      },
      error: (error) => {
        console.error('Error al cerrar sesión:', error);
      }
    });
  }
}
