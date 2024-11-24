
import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { map, Observable, of, Subject, switchMap, takeUntil} from 'rxjs';
import { Router } from '@angular/router';
import { PacienteService } from '../../../services/pacientes.service';
import { PacienteDto } from '../../../models/user.dto';
import { ModalComponent } from '../../modal/modal.component';
import { Diagnostico } from '../../../models/diagnostico.dto';
import { TratamientoDto } from '../../../models/tratamiento.dto';
import { ModalDto, modalInitializer } from '../../modal/modal.dto';
import { Store } from '@ngrx/store';
import { selectUserData } from '../../../store/user.selector';
import { EstadoTurno, TurnoDto } from '../../../models/turno.dto';

@Component({
  selector: 'app-paciente-datos',
  standalone: true,
  imports: [
      CommonModule,
      ModalComponent

  ],
  templateUrl: './paciente-datos.component.html',
  styleUrl: './paciente-datos.component.css'
})
export class PacienteDatosComponent implements OnInit, OnDestroy {
  paciente: PacienteDto | null = null;
  tratamientos: TratamientoDto[] = [];
  private destroy$ = new Subject<void>();
  modal: ModalDto = modalInitializer(); 
  @Output() agendarTurno = new EventEmitter<PacienteDto>();

  constructor(private pacienteService: PacienteService,
              private router: Router,
              private store: Store
  ) {}

  ngOnInit() {
    this.pacienteService.pacienteSeleccionado$
      .pipe(takeUntil(this.destroy$)) 
      .subscribe((paciente) => {
        this.paciente = paciente;
        //console.log('paciente recibido en paciente-datos:', this.paciente);
        if (this.paciente?.id) {
          this.obtenerTratamientos(this.paciente.id);
        }
      });
      this.store.select(selectUserData).subscribe((userData) => {
        if (userData?.id) {
          this.limpiarTurnosPasados(userData.id); 
        }
      });
  }

  ngOnDestroy() {
    this.destroy$.next(); 
    this.destroy$.complete(); 
  }

  emitirAgendarTurno() {
    if (this.paciente) {
      this.agendarTurno.emit(this.paciente);
    }
  }

  agregarDiagnostico() {
    if (this.paciente) {
      this.router.navigate(['/diagnosticos']);
    }
  }

  verDiagnostico(diagnostico: Diagnostico) {
    this.pacienteService.seleccionarDiagnostico(diagnostico);
    this.router.navigate(['/ver-diagnostico']);
  }

  eliminarDiagnostico(diagnosticoId: string) {
    if (this.paciente && this.paciente.id) {
      this.pacienteService.eliminarDiagnostico(this.paciente.id, diagnosticoId).subscribe({
        next: () => {
          //console.log('Diagnóstico eliminado con éxito');
          if (this.paciente?.diagnosticos) {
            this.paciente.diagnosticos = this.paciente.diagnosticos.filter(d => d.id !== diagnosticoId);
          }
          this.cerrarModal();
        },
        error: (error) => {
          console.error('Error al eliminar el diagnóstico:', error);
        }
      });
    }
  }

  eliminarTurno(turnoId: string) {
    if (this.paciente && turnoId) {
      this.verificarYEliminarSolicitud(turnoId).subscribe({
        next: () => {
          this.actualizarTurnosLocales(turnoId);
          this.cerrarModal();
          this.mostrarNotificacion('Turno eliminado correctamente.', false, false);
        },
        error: (error) => {
          console.error('Error al eliminar turno y solicitud:', error);
          this.mostrarNotificacion('Error al eliminar turno.', true, false);
        },
      });
    }
  }
  
  private verificarYEliminarSolicitud(turnoId: string): Observable<void> {
    return this.pacienteService.verificarSolicitudPendiente(turnoId).pipe(
      switchMap((existeSolicitud) => {
        if (existeSolicitud && this.paciente) {
          return this.obtenerYEliminarSolicitud(turnoId, this.paciente.id!);
        } else if (this.paciente) {
          return this.pacienteService.eliminarTurno(this.paciente.id!, turnoId);
        } else {
          return of();
        }
      })
    );
  }
  
  private obtenerYEliminarSolicitud(turnoId: string, pacienteId: string): Observable<void> {
    return this.pacienteService.obtenerSolicitudesPorMedico(this.paciente!.medicoId!).pipe(
      map((solicitudes) =>
        solicitudes.find((solicitud) => solicitud.turnoId === turnoId)
      ),
      switchMap((solicitudAsociada) => {
        if (solicitudAsociada) {
          return this.pacienteService.eliminarTurnoYSolicitud(
            pacienteId,
            turnoId,
            solicitudAsociada.id
          );
        } else {
          return this.pacienteService.eliminarTurno(pacienteId, turnoId);
        }
      })
    );
  }
  
  private actualizarTurnosLocales(turnoId: string): void {
    if (this.paciente?.turnos) {
      this.paciente.turnos = this.paciente.turnos.filter((turno) => turno.id !== turnoId);
    }
  }

  cambiarEstadoTurno(turno: TurnoDto) {
    if (!this.paciente) {
      console.error('No hay un paciente seleccionado.');
      return;
    }
  
    const nuevoEstado = turno.estado === EstadoTurno.Programado 
      ? EstadoTurno.Cancelado 
      : EstadoTurno.Programado;
  
    this.pacienteService
      .actualizarEstadoTurno(this.paciente.id!, turno.id, nuevoEstado)
      .subscribe({
        next: () => {
          if (this.paciente?.turnos) {
            this.paciente.turnos = this.paciente.turnos.map((t) =>
              t.id === turno.id ? { ...t, estado: nuevoEstado } : t
            );
          }
          //console.log('Estado del turno actualizado con éxito');
        },
        error: (error) => {
          console.error('Error al actualizar el estado del turno:', error);
        },
      });
  }

  limpiarTurnosPasados(userId: string): void {
    this.pacienteService.eliminarTurnosPasados(userId).subscribe({
      next: () => {
        //console.log('Turnos pasados eliminados correctamente.');
      },
      error: (error) => {
        console.error('Error al eliminar turnos pasados:', error);
      }
    });
  }

  obtenerTratamientos(pacienteId: string) {
    this.pacienteService.obtenerTratamientosPorPaciente(pacienteId).subscribe({
      next: (tratamientos) => {
        this.tratamientos = tratamientos;
        //console.log('Tratamientos del paciente:', this.tratamientos);
      },
      error: (error) => {
        console.error('Error al obtener tratamientos del paciente:', error);
      }
    });
  }

  abrirModalEliminarTratamiento(tratamientoId: string) {
    this.modal = {
      ...modalInitializer(),
      show: true,
      message: '¿Estás seguro de que deseas eliminar este tratamiento?',
      isConfirm: true,
      close: () => this.cerrarModal(),
      confirm: () => this.eliminarTratamiento(tratamientoId)
    };
  }

  eliminarTratamiento(tratamientoId: string) {
    this.pacienteService.eliminarTratamiento(tratamientoId).subscribe({
      next: () => {
        this.tratamientos = this.tratamientos.filter(t => t.id !== tratamientoId);
        this.cerrarModal();
      },
      error: (error) => {
        console.error('Error al eliminar el tratamiento:', error);
        this.cerrarModal();
      }
    });
  }

  obtenerDiaDeLaSemana(fecha: string): string {
    const diasDeLaSemana = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
    const [year, month, day] = fecha.split('-').map(Number);
    const date = new Date(year, month - 1, day); 
    const diaIndex = date.getDay(); 
    return diasDeLaSemana[diaIndex];
  }

  abrirModalEliminarTurno(turnoId: string) {
    this.modal = {
      ...modalInitializer(),
      show: true,
      message: '¿Estás seguro de que deseas eliminar este turno?',
      isConfirm: true,
      close: () => this.cerrarModal(),
      confirm: () => this.eliminarTurno(turnoId)
    };
  }
  
  cerrarModal() {
    this.modal = modalInitializer();
  }
  
  ejecutarAccionConfirmada() {
    console.log('Acción confirmada');
    this.cerrarModal();
  }

  abrirModalEliminarDiagnostico(diagnosticoId: string) {
    this.modal = {
      ...modalInitializer(),
      show: true,
      message: '¿Estás seguro de que deseas eliminar este diagnóstico?',
      isConfirm: true,
      close: () => this.cerrarModal(),
      confirm: () => this.eliminarDiagnostico(diagnosticoId)
    };
  }

  mostrarNotificacion(mensaje: string, esError: boolean, esConfirmacion: boolean = false): void {
    this.modal = {
      show: true,
      message: mensaje,
      isError: esError && !esConfirmacion,
      isSuccess: !esError && !esConfirmacion,
      isConfirm: esConfirmacion,
      close: () => this.cerrarModal(),
      confirm: esConfirmacion ? this.modal.confirm : undefined,
    };
  
    if (!esConfirmacion) {
      setTimeout(() => this.cerrarModal(), 2000); 
    }
  }

  agregarTratamiento() {
    if (this.paciente) {
      this.pacienteService.seleccionarPaciente(this.paciente);
      this.router.navigate(['/tratamientos']);
    }
  }

  verTratamiento(tratamiento: TratamientoDto) {
    this.pacienteService.seleccionarTratamiento(tratamiento);
    this.router.navigate(['/ver-tratamiento']);
  }


}
