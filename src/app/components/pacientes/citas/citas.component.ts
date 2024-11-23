import { Component, OnInit } from '@angular/core';
import { SolicitudDto, TurnoDto } from '../../../models/turno.dto';
import { forkJoin, map, Observable, of, switchMap, tap } from 'rxjs';
import { PacienteService } from '../../../services/pacientes.service';
import { Store } from '@ngrx/store';
import { selectUserData } from '../../../store/user.selector';
import { CommonModule } from '@angular/common';
import { SpinnerService } from '../../../services/spinner.service';
import { SafeResourceUrl } from '@angular/platform-browser';
import { PacienteDto } from '../../../models/user.dto';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ModalComponent } from '../../modal/modal.component';
import { ModalDto, modalInitializer } from '../../modal/modal.dto';

@Component({
  selector: 'app-citas',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ModalComponent
  ],
  templateUrl: './citas.component.html',
  styleUrl: './citas.component.css'
})
export class CitasComponent implements OnInit {
  paciente: PacienteDto | null = null;
  turnos$: Observable<TurnoDto[]> = of([]);
  turnoSeleccionado: TurnoDto | null = null;
  safeMapUrl: SafeResourceUrl | null = null;
  showNoCitasMessage: boolean = false; 
  modalAbierto = false;
  solicitudForm: FormGroup;
  solicitudPendiente: boolean = false;

  modal: ModalDto = modalInitializer();

  constructor(
    private pacienteService: PacienteService,
    private store: Store,
    private spinners: SpinnerService,
    private fb: FormBuilder
  ) {
    this.solicitudForm = this.fb.group({
      motivo: ['', Validators.required],
      fechaPropuesta: [''],
      horaPropuesta: ['']
    });
  }

  ngOnInit(): void {
    this.limpiarTurnosPasados();

    this.spinners.show();

    this.turnos$ = this.store.select(selectUserData).pipe(
      switchMap((userData) => {
        const userCedula = userData?.detalles?.cedula;
        if (userCedula) {
          return this.pacienteService.obtenerPacientes().pipe(
            map((pacientes) =>
              pacientes.filter((p) => p.cedula === userCedula)
            ),
            switchMap((pacientes) => {
              if (pacientes.length > 0) {
                const turnosObservables = pacientes.map((paciente) =>
                  this.pacienteService.obtenerTurnosPorPacienteId(paciente.id!)
                );
                return forkJoin(turnosObservables).pipe(
                  map((turnosPorPaciente) => turnosPorPaciente.flat()),
                  tap((turnos) => {
                    //console.log(turnos); 
                  })
                );
              }
              return of([]);
            })
          );
        }
        return of([]);
      }),
      map((result) => {
        this.spinners.hide(); 
        if (result.length === 0) {
          setTimeout(() => {
            this.showNoCitasMessage = true; 
          }, 2000);
        }
        return result;
      })
    );
  }

  seleccionarTurno(turno: TurnoDto): void {
    this.turnoSeleccionado = turno;
    this.pacienteService.verificarSolicitudPendiente(turno.id).subscribe({
      next: (existePendiente) => {
        this.solicitudPendiente = existePendiente;
      },
      error: (error) => {
        this.solicitudPendiente = false; 
        this.mostrarModal(true, 'Error al verificar el estado de la solicitud.', false);
      }
    });
    this.pacienteService.seleccionarTurno(turno);
  }

  limpiarTurnosPasados(): void {
    this.store.select(selectUserData).subscribe(userData => {
      if (userData?.id) {
        this.pacienteService.eliminarTurnosPasados(userData.id).subscribe({
          next: () => {
            //console.log('Turnos pasados eliminados para el paciente.');
          },
          error: (error) => {
            console.error('Error al eliminar turnos pasados del paciente:', error);
          }
        });
      }
    });
  }

  enviarSolicitud() {
    if (this.solicitudForm.invalid) {
      this.solicitudForm.markAllAsTouched();
      //console.error('Formulario inválido.');
      if (this.solicitudForm.get('motivo')?.hasError('required')) {
        this.mostrarModal(true, 'El campo "Motivo de Solicitud" es obligatorio.', false);
      }
      return;
    }
    const { motivo, fechaPropuesta, horaPropuesta } = this.solicitudForm.value;
    if (this.turnoSeleccionado) {
      this.crearSolicitud(
        this.turnoSeleccionado,
        motivo,
        fechaPropuesta,
        horaPropuesta
      );
    } else {
      console.error('No hay un turno seleccionado.');
    }
  }

  crearSolicitud(turno: TurnoDto, motivo: string, fechaPropuesta: string, horaPropuesta: string) {
    if (!turno.pacienteId) {
      console.error('El turno no tiene un pacienteId asociado.');
      return;
    }

    const nuevaSolicitud: SolicitudDto = {
      id: '',
      pacienteId: turno.pacienteId,
      medicoId: turno.medicoId,
      turnoId: turno.id,
      motivo,
      fechaPropuesta,
      horaPropuesta,
      estado: 'pendiente',
      fechaCreacion: new Date().toISOString(),
    };

    this.pacienteService.crearSolicitud(nuevaSolicitud).subscribe({
      next: () => {
        this.mostrarModal(false, 'Solicitud creada exitosamente.', true);
        this.cerrarModal();
      },
      error: (error) => {
        console.error('Error al crear solicitud:', error);
        this.mostrarModal(true, 'Error al crear la solicitud.', false);
      },
    });
  }

  abrirModalSolicitarCambio(turno: TurnoDto): void {
    //console.log('Datos del turno seleccionado:', turno);
    this.turnoSeleccionado = turno; 
    this.modalAbierto = true; 
  }

  cerrarModal() {
    this.modalAbierto = false;
    this.turnoSeleccionado = null;

    if (this.solicitudForm) {
      this.solicitudForm.reset();
    }
  }

  mostrarModal(isError: boolean, message: string, isSuccess: boolean) {
    this.modal = {
      ...this.modal,
      show: true,
      message,
      isError,
      isSuccess,
      close: () => this.cerrarModal(),
    };
  
    setTimeout(() => {
      this.closeModal();
    }, 2000); 
  }

  closeModal() {
    this.modal = modalInitializer();
  }
}
