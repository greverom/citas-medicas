import { Component, OnInit } from '@angular/core';
import { SolicitudDto, TurnoDto } from '../../../models/turno.dto';
import { forkJoin, map, Observable, switchMap } from 'rxjs';
import { Store } from '@ngrx/store';
import { PacienteService } from '../../../services/pacientes.service';
import { selectUserData } from '../../../store/user.selector';
import { CommonModule } from '@angular/common';
import { PacienteDto } from '../../../models/user.dto';
import { ModalDto, modalInitializer } from '../../modal/modal.dto';
import { ModalComponent } from '../../modal/modal.component';

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
  solicitudesDetalladas$: Observable<any[]> | null = null;
  solicitudSeleccionada: { solicitud: SolicitudDto; paciente: PacienteDto | null; turno: TurnoDto | null } | null = null;
  modal: ModalDto = modalInitializer();
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
            )
          );
      }
    });
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
        this.mostrarNotificacion('Turno actualizado correctamente.', false);
      },
      error: (error) => {
        console.error('Error al actualizar la fecha del turno:', error);
        this.mostrarNotificacion('Error al actualizar el turno.', true);
      },
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
