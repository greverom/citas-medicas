import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { map, Observable } from 'rxjs';
import { selectIsLoggedIn, selectUserData } from '../../store/user.selector';
import { CommonModule } from '@angular/common';
import { UserDto, UserRole } from '../../models/user.dto';
import { AuthService } from '../../services/auth.service';
import { ModalComponent } from '../modal/modal.component';
import { ModalDto, modalInitializer } from '../modal/modal.dto';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    RouterModule,
    CommonModule,
    ModalComponent
  ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  modal: ModalDto = modalInitializer(); 
  isLoggedIn$: Observable<boolean>;
  isAdmin$: Observable<boolean>;
  isMedico$: Observable<boolean>;
  isPaciente$: Observable<boolean>;
  navTitle$: Observable<string>;

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

    this.navTitle$ = this.store.select(selectUserData).pipe(
      map((user: UserDto | null) => {
        if (user?.role === UserRole.Medico) {
          return 'Médico';
        } else if (user?.role === UserRole.Paciente) {
          return 'Paciente';
        } else if (user?.role === UserRole.Admin) {
          return 'Administrador';
        } else {
          return 'Citas Médicas'; 
        }
      })
    );
  }

  logout() {
    this.mostrarModal(
      '¿Estás seguro de que deseas cerrar sesión?',
      false, 
      true,  
      () => this.confirmarLogout() 
    );
  }
  
  confirmarLogout() {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/home']);
      },
      error: (error) => {
        console.error('Error al cerrar sesión:', error);
        this.mostrarModal('Error al cerrar sesión', true); 
      }
    });
  }

  mostrarModal(mensaje: string, esError: boolean, esConfirmacion: boolean = false, accionConfirmacion?: () => void) {
    this.modal = {
      show: true,
      message: mensaje,
      isError: esError && !esConfirmacion,
      isSuccess: !esError && !esConfirmacion,
      isConfirm: esConfirmacion || false,  
      close: () => this.closeModal(),
      confirm: accionConfirmacion,
    };
  
    if (!esConfirmacion) {
      setTimeout(() => this.closeModal(), 2000);
    }
  }

  closeModal() {
    this.modal = modalInitializer(); 
  }
}
