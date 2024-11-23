import { Component, OnInit } from '@angular/core';
import { forkJoin, map, Observable, switchMap } from 'rxjs';
import { Store } from '@ngrx/store';
import { CommonModule } from '@angular/common';
import { SolicitudDto, TurnoDto } from '../../models/turno.dto';
import { ModalComponent } from '../../components/modal/modal.component';
import { PacienteDto } from '../../models/user.dto';
import { ModalDto, modalInitializer } from '../../components/modal/modal.dto';
import { PacienteService } from '../../services/pacientes.service';
import { selectUserData } from '../../store/user.selector';

@Component({
  selector: 'app-solicitud-turno',
  standalone: true,
  imports: [
      CommonModule,
      ModalComponent
  ],
  templateUrl: './solicitud-turno.component.html',
  styleUrl: './solicitud-turno.component.css'
})
export class SolicitudTurnoComponent implements OnInit {
  medicoId: string | null = null;
  solicitudesDetalladas$: Observable<{
    pendientes: { solicitud: SolicitudDto; paciente: PacienteDto | null; turno: TurnoDto | null }[];
    aprobadas: { solicitud: SolicitudDto; paciente: PacienteDto | null; turno: TurnoDto | null }[];}> | null = null;
  solicitudSeleccionada: { solicitud: SolicitudDto; paciente: PacienteDto | null; turno: TurnoDto | null } | null = null;
  modal: ModalDto = modalInitializer();
  vistaActual: 'pendientes' | 'aprobadas' = 'pendientes'; 

  constructor(
    private store: Store,
    private pacienteService: PacienteService
  ) {}

  ngOnInit(): void {
    this.store.select(selectUserData).subscribe((userData) => {
      if (userData?.id) {
        this.medicoId = userData.id;
        this.solicitudesDetalladas$ = this.pacienteService
          .obtenerSolicitudesPorMedico(this.medicoId)
          .pipe(
            switchMap((solicitudes) =>
              forkJoin(
                solicitudes.map((solicitud) =>
                  this.pacienteService
                    .obtenerPaciente(solicitud.pacienteId)
                    .pipe(
                      switchMap((paciente) =>
                        this.pacienteService
                          .obtenerTurnoPorId(
                            solicitud.pacienteId,
                            solicitud.turnoId
                          )
                          .pipe(
                            map((turno) => ({
                              solicitud,
                              paciente,
                              turno,
                            }))
                          )
                      )
                    )
                )
              )
            ),
            map((solicitudes) => {
              return {
                pendientes: solicitudes.filter((s) => s.solicitud.estado === 'pendiente'),
                aprobadas: solicitudes.filter((s) => s.solicitud.estado === 'aprobada'),
              };
            })
          );
      }
    });
  }

  cambiarVista(vista: 'pendientes' | 'aprobadas'): void {
    this.vistaActual = vista;
  }

  seleccionarSolicitud(solicitud: SolicitudDto): void {
    this.pacienteService.obtenerPaciente(solicitud.pacienteId).pipe(
      switchMap((paciente) =>
        this.pacienteService.obtenerTurnoPorId(solicitud.pacienteId, solicitud.turnoId).pipe(
          map((turno) => ({
            solicitud,
            paciente,
            turno,
          }))
        )
      )
    ).subscribe((detalle) => {
      this.solicitudSeleccionada = detalle;
      console.log('Solicitud seleccionada:', this.solicitudSeleccionada);
    });
  }

  cambiarFechaTurno(): void {
    if (!this.solicitudSeleccionada || !this.solicitudSeleccionada.turno) {
      console.error('No hay solicitud o turno seleccionado');
      return;
    }
  
    const { paciente, turno, solicitud } = this.solicitudSeleccionada;
  
    if (!paciente || !turno) {
      console.error('Datos del paciente o turno incompletos.');
      return;
    }
    if (!paciente.id) {
      console.error('El paciente no tiene un ID asociado.');
      return;
    }
  
    this.pacienteService
      .actualizarFechaHoraTurno(paciente.id, turno.id, solicitud.fechaPropuesta!, solicitud.horaPropuesta!)
      .subscribe({
        next: () => {
          console.log('Fecha y hora del turno actualizadas exitosamente');
          this.actualizarEstadoSolicitud(solicitud.id, 'aprobada');
          this.solicitudSeleccionada = null;
        },
        error: (error) => {
          console.error('Error al actualizar la fecha del turno:', error);
          this.mostrarNotificacion('Error al actualizar el turno.', true);
        },
      });
  }
  
  actualizarEstadoSolicitud(solicitudId: string, nuevoEstado: string): void {
    this.pacienteService.actualizarEstadoSolicitud(solicitudId, nuevoEstado).subscribe({
      next: () => {
        console.log('Estado de la solicitud actualizado a:', nuevoEstado);
        this.mostrarNotificacion('Solicitud aprobada correctamente.', false);

        this.actualizarListasLocales(solicitudId, nuevoEstado);
      },
      error: (error) => {
        console.error('Error al actualizar el estado de la solicitud:', error);
        this.mostrarNotificacion('Error al actualizar el estado de la solicitud.', true);
      },
    });
  }

  actualizarListasLocales(solicitudId: string, nuevoEstado: string): void {
    if (!this.solicitudesDetalladas$) return;
  
    this.solicitudesDetalladas$.subscribe((detalladas) => {
      const solicitudPendienteIndex = detalladas.pendientes.findIndex(
        (solicitud) => solicitud.solicitud.id === solicitudId
      );
  
      if (solicitudPendienteIndex !== -1 && nuevoEstado === 'aprobada') {
        const solicitudAprobada = detalladas.pendientes.splice(solicitudPendienteIndex, 1)[0];
        solicitudAprobada.solicitud.estado = nuevoEstado; // Actualizar el estado localmente
        detalladas.aprobadas.push(solicitudAprobada);
  
        this.solicitudesDetalladas$ = new Observable((observer) => {
          observer.next(detalladas);
          observer.complete();
        });
      }
    });
  }


mostrarNotificacion(mensaje: string, esError: boolean): void {
  this.modal = {
    show: true,
    message: mensaje,
    isError: esError,
    isSuccess: !esError,
    isConfirm: false,
    close: () => this.cerrarModal()
  };

  setTimeout(() => this.cerrarModal(), 2000);
}
  
  cerrarModal(): void {
    this.modal = modalInitializer(); 
  }
}
