import { Component } from '@angular/core';
import { CitasComponent } from '../../components/pacientes/citas/citas.component';
import { CommonModule } from '@angular/common';
import { DiagnosticosComponent } from '../../components/pacientes/diagnosticos/diagnosticos.component';
import { TratamientosComponent } from "../../components/pacientes/tratamientos/tratamientos.component";
import { ModalDto, modalInitializer } from '../../components/modal/modal.dto';
import { Store } from '@ngrx/store';
import { Router } from '@angular/router';
import { selectUserData } from '../../store/user.selector';
import { ModalComponent } from '../../components/modal/modal.component';

@Component({
  selector: 'app-paciente-servicios',
  standalone: true,
  imports: [
    CommonModule,
    CitasComponent,
    DiagnosticosComponent,
    TratamientosComponent,
    ModalComponent
],
  templateUrl: './paciente-servicios.component.html',
  styleUrl: './paciente-servicios.component.css'
})
export class PacienteServiciosComponent {
  modal: ModalDto = modalInitializer();

  constructor(private store: Store, private router: Router) {}

  ngOnInit(): void {
    this.store.select(selectUserData).subscribe((userData) => {
      if (userData && userData.role === 'paciente') {
        const cedulaCompletada = userData.detalles && 'cedula' in userData.detalles && userData.detalles.cedula;

        if (!cedulaCompletada) {
          this.mostrarModal(
            'Por favor, complete su perfil para acceder a los servicios médicos.',
            true, false, undefined, '/perfil' 
          );
        }
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
}
