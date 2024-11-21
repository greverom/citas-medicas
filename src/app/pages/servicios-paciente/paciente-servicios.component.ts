import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalDto, modalInitializer } from '../../components/modal/modal.dto';
import { Store } from '@ngrx/store';
import { ActivatedRoute, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { selectUserData } from '../../store/user.selector';
import { ModalComponent } from '../../components/modal/modal.component';
import { SpinnerComponent } from '../../components/spinner/spinner.component';
import { filter } from 'rxjs';

@Component({
  selector: 'app-paciente-servicios',
  standalone: true,
  imports: [
    CommonModule,
    ModalComponent,
    RouterOutlet,
    SpinnerComponent
],
  templateUrl: './paciente-servicios.component.html',
  styleUrl: './paciente-servicios.component.css'
})
export class PacienteServiciosComponent {
  modal: ModalDto = modalInitializer();
  selectedButton: string | null = null;
  currentTitle: string = 'Servicios del Paciente';

  constructor(private store: Store, private activatedRoute: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        const route = this.activatedRoute.firstChild?.snapshot.url[0]?.path;
        if (route) {
          this.selectedButton = route;
          this.updateTitle(route);
        }
      });
  }

  mostrarModal(
    mensaje: string,
    esError: boolean,
    esConfirmacion: boolean = false,
    accionConfirmacion?: () => void,
    rutaRedireccion?: string
  ) {
    this.modal = {
      show: true,
      message: mensaje,
      isError: esError && !esConfirmacion,
      isSuccess: !esError && !esConfirmacion,
      isConfirm: esConfirmacion || false,
      showRedirectButton: !!rutaRedireccion,
      close: () => this.closeModal(),
      confirm: accionConfirmacion,
      redirect: rutaRedireccion
        ? () => {
            this.router.navigate([rutaRedireccion]);
            this.closeModal();
          }
        : undefined,
    };

    if (!esConfirmacion && !rutaRedireccion) {
      setTimeout(() => this.closeModal(), 2000);
    }
  }

  closeModal() {
    this.modal = modalInitializer();
  }

  navigateTo(route: string): void {
    this.selectedButton = route; 
    this.router.navigate([`/servicios/${route}`]); 
  }

  updateTitle(route: string): void {
    switch (route) {
      case 'citas':
        this.currentTitle = 'Citas del Paciente';
        break;
      case 'diagnosticos':
        this.currentTitle = 'Diagnósticos del Paciente';
        break;
      case 'tratamientos':
        this.currentTitle = 'Tratamientos del Paciente';
        break;
      default:
        this.currentTitle = 'Servicios del Paciente';
        break;
    }
  }
}
