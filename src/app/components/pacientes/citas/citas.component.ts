import { Component, OnDestroy, OnInit } from '@angular/core';
import { SolicitudDto, TurnoDto } from '../../../models/turno.dto';
import { forkJoin, map, Observable, of, switchMap, tap } from 'rxjs';
import { PacienteService } from '../../../services/pacientes.service';
import { Store } from '@ngrx/store';
import { selectUserData } from '../../../store/user.selector';
import { CommonModule } from '@angular/common';
import { SpinnerService } from '../../../services/spinner.service';
import { SafeResourceUrl } from '@angular/platform-browser';
import { DetallesMedico, PacienteDto, UserDto } from '../../../models/user.dto';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ModalComponent } from '../../modal/modal.component';
import { ModalDto, modalInitializer } from '../../modal/modal.dto';
import { HorasDisponiblesService } from '../../../services/horas-disponibles.service';

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
export class CitasComponent implements OnInit, OnDestroy {
  paciente: PacienteDto | null = null;
  turnos$: Observable<TurnoDto[]> = of([]);
  turnoSeleccionado: TurnoDto | null = null;
  safeMapUrl: SafeResourceUrl | null = null;
  showNoCitasMessage: boolean = false; 
  modalAbierto = false;
  solicitudForm: FormGroup;
  solicitudPendiente: boolean = false;
  medicosAsociados: (UserDto & { detalles: DetallesMedico })[] = [];
  modal: ModalDto = modalInitializer();
  modalSolicitudTurnoAbierto: boolean = false;

  horasDisponibles: string[] = [];

  constructor(
    private pacienteService: PacienteService,
    private store: Store,
    private spinners: SpinnerService,
    private fb: FormBuilder,
    private horasDisponiblesService: HorasDisponiblesService
  ) {
    this.solicitudForm = this.fb.group({
      medicoId: [''], 
      motivo: ['', Validators.required], 
      fechaPropuesta: [''], 
      horaPropuesta: ['', Validators.required], 
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
                const paciente = pacientes[0]; 
                this.paciente = paciente;
  
                this.obtenerMedicosAsociados(userCedula);
  
                const turnosObservables = pacientes.map((paciente) =>
                  this.pacienteService.obtenerTurnosPorPacienteId(paciente.id!)
                );
                return forkJoin(turnosObservables).pipe(
                  map((turnosPorPaciente) => turnosPorPaciente.flat()),
                  tap((turnos) => {
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

    this.solicitudForm.get('medicoId')?.valueChanges.subscribe((medicoId: string) => {
      const fechaPropuesta = this.solicitudForm.get('fechaPropuesta')?.value;
      if (medicoId && fechaPropuesta) {
        this.filtrarHorasPorMedicoYFecha(medicoId, fechaPropuesta);
      }
    });
  
    this.solicitudForm.get('fechaPropuesta')?.valueChanges.subscribe((fecha: string) => {
      const medicoId = this.solicitudForm.get('medicoId')?.value;
      if (medicoId && fecha) {
        this.filtrarHorasPorMedicoYFecha(medicoId, fecha);
      }
    });
  
    this.horasDisponiblesService.horasDisponibles$.subscribe((horas) => {
      this.horasDisponibles = horas; 
    });
  }

  ngOnDestroy(): void {
    this.horasDisponiblesService.limpiarEstadoGlobal(); 
  }

  obtenerMedicosAsociados(cedula: string): void {
    this.pacienteService.obtenerMedicosAsociadosAPaciente(cedula).subscribe({
      next: (medicos) => {
        this.medicosAsociados = medicos;
        //console.log(this.medicosAsociados);
      },
      error: (error) => {
        console.error('Error al obtener médicos asociados al paciente:', error);
      },
    });
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

  filtrarHorasPorMedicoYFecha(medicoId: string, fecha: string): void {
    if (!medicoId || !fecha) {
      console.error('MedicoId y Fecha son obligatorios para filtrar las horas.');
      return;
    }
  
    this.pacienteService.obtenerTurnosDePacientesPorMedico(medicoId).subscribe({
      next: (turnos) => {
        const horasOcupadas = turnos
          .filter((turno) => turno.fecha === fecha)
          .map((turno) => turno.hora);
  
        const horasDisponibles = this.generarHorasDisponibles().filter(
          (hora) => !horasOcupadas.includes(hora)
        );
  
        this.horasDisponiblesService.actualizarHorasDisponiblesPorMedico(medicoId, horasDisponibles);
      },
      error: (error) => {
        console.error('Error al obtener turnos del médico:', error);
      },
    });
  }

  generarHorasDisponibles(): string[] {
    const horas: string[] = [];
    for (let i = 9; i <= 18; i++) {
      horas.push(`${i}:00`);
    }
    return horas;
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

  abrirModalSolicitudTurno(): void {
    this.modalSolicitudTurnoAbierto = true;
  }

  cerrarModalSolicitudTurno(): void {
    this.modalSolicitudTurnoAbierto = false;
    this.solicitudForm.reset(); 
  
    this.horasDisponibles = [];
    this.horasDisponiblesService.limpiarEstadoGlobal();
  }


  solicitarNuevoTurno() {
    if (this.solicitudForm.invalid) {
      this.solicitudForm.markAllAsTouched();
      if (this.solicitudForm.get('motivo')?.hasError('required')) {
        this.mostrarModal(true, 'El campo "Motivo de Solicitud" es obligatorio.', false);
      }
      return;
    }
  
    const { motivo, fechaPropuesta, horaPropuesta, medicoId } = this.solicitudForm.value;
  
    if (!this.paciente?.id) {
      console.error('No se encontró el ID del paciente.');
      return;
    }
  
    const nuevaSolicitud: SolicitudDto = {
      id: '',
      pacienteId: this.paciente.id,
      medicoId: medicoId, 
      turnoId: '', 
      motivo,
      fechaPropuesta,
      horaPropuesta,
      estado: 'pendiente',
      fechaCreacion: new Date().toISOString(),
    };
  
    this.pacienteService.crearSolicitudTurno(nuevaSolicitud).subscribe({
      next: () => {
        this.mostrarModal(false, 'Solicitud de turno enviada exitosamente.', true);
        this.cerrarModalSolicitudTurno(); 
      },
      error: (error) => {
        console.error('Error al enviar la solicitud de turno:', error);
        this.mostrarModal(true, 'Error al enviar la solicitud de turno.', false);
      },
    });
  }

  abrirModalSolicitarCambio(turno: TurnoDto): void {
    this.turnoSeleccionado = turno;
    this.modalAbierto = true;
  
    this.solicitudForm.patchValue({
      medicoId: turno.medicoId,
      fechaPropuesta: turno.fecha,
      horaPropuesta: turno.hora,
      motivo: '', 
    });
  
    if (turno.medicoId && turno.fecha) {
      this.filtrarHorasPorMedicoYFecha(turno.medicoId, turno.fecha);
    }
  }

  cerrarModal() {
    this.modalAbierto = false;
    this.turnoSeleccionado = null; 
  
    if (this.solicitudForm) {
      this.solicitudForm.reset(); 
      this.solicitudForm.patchValue({ medicoId: '', fechaPropuesta: '', horaPropuesta: '' }); 
    }
  
    this.horasDisponiblesService.limpiarEstadoGlobal();
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
