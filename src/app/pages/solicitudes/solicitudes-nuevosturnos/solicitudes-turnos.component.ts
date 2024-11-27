import { Component, OnInit } from '@angular/core';
import { EstadoTurno, SolicitudDto, TurnoDto } from '../../../models/turno.dto';
import { forkJoin, map } from 'rxjs';
import { PacienteService } from '../../../services/pacientes.service';
import { Store } from '@ngrx/store';
import { selectUserData } from '../../../store/user.selector';
import { CommonModule } from '@angular/common';
import { DetallesMedico, PacienteDto } from '../../../models/user.dto';
import { Router } from '@angular/router';
import { ModalDto, modalInitializer } from '../../../components/modal/modal.dto';
import { ModalComponent } from '../../../components/modal/modal.component';

@Component({
  selector: 'app-solicitudes-turnos',
  standalone: true,
  imports: [ CommonModule,
          ModalComponent
  ],
  templateUrl: './solicitudes-turnos.component.html',
  styleUrl: './solicitudes-turnos.component.css'
})

export class SolicitudesTurnosComponent implements OnInit {
  medicoId: string | null = null; 
  nombreMedico: string = '';
  medicoDetalles: DetallesMedico | undefined;
  solicitudesTurnos: { solicitud: SolicitudDto; paciente: PacienteDto | null }[] = [];
  modal: ModalDto = modalInitializer();

  constructor(private pacienteService: PacienteService, private store: Store, private router:Router) {}

  ngOnInit(): void {
    this.store.select(selectUserData).subscribe((userData) => {
      this.medicoId = userData?.id ?? null; 
      this.nombreMedico = userData?.name ?? '';
      this.medicoDetalles = userData?.detalles as DetallesMedico;

      this.cargarSolicitudesTurnos();
    });
  }

  cargarSolicitudesTurnos(): void {
    if (!this.medicoId) {
      return;
    }
  
    this.pacienteService.obtenerSolicitudesNuevosTurnosPorMedico(this.medicoId).subscribe({
      next: (solicitudes) => {
        if (solicitudes.length > 0) {
          const solicitudesConPacientes$ = solicitudes.map((solicitud) =>
            this.pacienteService.obtenerPaciente(solicitud.pacienteId).pipe(
              map((paciente) => ({
                solicitud,
                paciente, 
              }))
            )
          );
  
          forkJoin(solicitudesConPacientes$).subscribe((resultados) => {
            this.solicitudesTurnos = resultados; 
            //console.log('Solicitudes con pacientes:', this.solicitudesTurnos);
          });
        } else {
          this.solicitudesTurnos = [];
        }
      },
      error: (error) => {
        console.error('Error al obtener las solicitudes de turnos:', error);
      },
    });
  }

  aceptarSolicitud(solicitud: SolicitudDto, paciente: PacienteDto | null): void {
    if (!paciente || !paciente.id || !this.medicoId) {
      console.error('No se encontró el paciente o el médico.');
      this.mostrarNotificacion('Error: No se encontró el paciente o el médico.', true);
      return;
    }
  
    const nuevoTurno: TurnoDto = {
      id: '', 
      pacienteId: paciente.id,
      medicoId: this.medicoId,
      fecha: solicitud.fechaPropuesta ?? '', 
      hora: solicitud.horaPropuesta ?? '',  
      estado: EstadoTurno.Programado,
      nombreMedico: this.nombreMedico,
      detallesMedico: this.medicoDetalles || undefined, 
      instrucciones: '', 
    };
  
    this.pacienteService.agendarTurno(paciente.id, nuevoTurno).subscribe({
      next: () => {
        this.rechazarSolicitud(solicitud.id); 
        this.mostrarNotificacion('Turno agendado correctamente.', false);
      },
      error: (error) => {
        console.error('Error al agendar el turno:', error);
        this.mostrarNotificacion('Error al agendar el turno.', true);
      },
    });
  }

  rechazarSolicitud(solicitudId: string): void {
    this.pacienteService.eliminarSolicitudTurno(solicitudId).subscribe({
      next: () => {
        this.solicitudesTurnos = this.solicitudesTurnos.filter(
          (item) => item.solicitud.id !== solicitudId
        );
        this.mostrarNotificacion('Solicitud eliminada correctamente.', false, false);
      },
      error: (error) => {
        console.error('Error al eliminar la solicitud:', error);
        this.mostrarNotificacion('Error al eliminar la solicitud.', true, false);
      },
    });
  }

  abrirModalRechazarSolicitud(solicitudId: string): void {
    this.modal = {
      ...modalInitializer(),
      show: true,
      message: '¿Estás seguro de que deseas eliminar esta solicitud?',
      isConfirm: true,
      close: () => this.cerrarModal(),
      confirm: () => this.rechazarSolicitud(solicitudId),
    };
  }

  mostrarNotificacion(mensaje: string, esError: boolean, esConfirmacion: boolean = false): void {
    this.modal = {
      ...modalInitializer(),
      show: true,
      message: mensaje,
      isError: esError && !esConfirmacion,
      isSuccess: !esError && !esConfirmacion,
      isConfirm: esConfirmacion,
      close: () => this.cerrarModal(),
    };

    if (!esConfirmacion) {
      setTimeout(() => this.cerrarModal(), 2000);
    }
  }

  cerrarModal(): void {
    this.modal = modalInitializer();
  }

  irASolicitudes(): void {
    this.router.navigate(['/solicitudes']);
  }
}
