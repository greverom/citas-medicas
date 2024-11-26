import { Component } from '@angular/core';
import { SolicitudDto } from '../../../models/turno.dto';
import { PacienteService } from '../../../services/pacientes.service';
import { Store } from '@ngrx/store';
import { selectUserData } from '../../../store/user.selector';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { forkJoin, map } from 'rxjs';

interface SolicitudConTipo {
  solicitud: SolicitudDto;
  nombrePaciente: string;
  tipo: 'nuevo-turno' | 'cambio-turno'; 
}

@Component({
  selector: 'app-notificacion-solicitud',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notificacion-solicitud.component.html',
  styleUrl: './notificacion-solicitud.component.css'
})


export class NotificacionSolicitudComponent {
  solicitudesPendientes: SolicitudConTipo[] = [];
  isDropdownOpen = false;
  medicoId: string | null = null;

  constructor(private pacienteService: PacienteService,
               private store: Store,
               private router: Router
  ) {}

  ngOnInit(): void {
    this.store.select(selectUserData).subscribe((userData) => {
      if (userData?.id) {
        this.medicoId = userData.id;

        this.cargarSolicitudesNuevosTurnos();
        this.cargarSolicitudesPendientes();
      }
    });
  }

  cargarSolicitudesNuevosTurnos(): void {
    if (!this.medicoId) {
      console.error('El médico no está definido');
      return;
    }
  
    this.pacienteService.obtenerSolicitudesNuevosTurnosPorMedico(this.medicoId).subscribe({
      next: (solicitudes) => {
        if (solicitudes.length > 0) {
          const solicitudesConPacientes$ = solicitudes.map((solicitud) =>
            this.pacienteService
              .obtenerPaciente(solicitud.pacienteId)
              .pipe(
                map((paciente) => ({
                  solicitud,
                  nombrePaciente: paciente
                    ? `${paciente.nombres} ${paciente.apellidos}`
                    : 'Paciente desconocido',
                  tipo: 'nuevo-turno' as const, 
                }))
              )
          );
  
          forkJoin(solicitudesConPacientes$).subscribe((resultados: SolicitudConTipo[]) => {
            this.solicitudesPendientes.push(...resultados);
          });
        }
      },
      error: (error) => {
        console.error('Error al obtener las solicitudes de nuevos turnos:', error);
      },
    });
  }

  cargarSolicitudesPendientes(): void {
    if (!this.medicoId) {
      console.error('El médico no está definido');
      return;
    }
  
    this.pacienteService.obtenerSolicitudesPendientesPorMedico(this.medicoId).subscribe({
      next: (solicitudes) => {
        if (solicitudes.length > 0) {
          const solicitudesConPacientes$ = solicitudes.map((solicitud) =>
            this.pacienteService
              .obtenerPaciente(solicitud.pacienteId)
              .pipe(
                map((paciente) => ({
                  solicitud,
                  nombrePaciente: paciente
                    ? `${paciente.nombres} ${paciente.apellidos}`
                    : 'Paciente desconocido',
                  tipo: 'cambio-turno' as const, 
                }))
              )
          );
  
          forkJoin(solicitudesConPacientes$).subscribe((resultados: SolicitudConTipo[]) => {
            this.solicitudesPendientes.push(...resultados);
          });
        }
      },
      error: (error) => {
        console.error('Error al obtener las solicitudes pendientes:', error);
      },
    });
  }

  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen; 
  }

  verSolicitud(solicitud: SolicitudConTipo): void {
    if (solicitud.tipo === 'nuevo-turno') {
      this.router.navigate(['/solicitudes/solicitud-nuevoturno']);
      return; 
    }
    if (solicitud.tipo === 'cambio-turno') {
      if (!solicitud.solicitud.turnoId || !solicitud.solicitud.pacienteId) {
        console.error('La solicitud no tiene un turno asociado o el paciente no está definido');
        return;
      }
      this.pacienteService.obtenerTurnoPorId(solicitud.solicitud.pacienteId, solicitud.solicitud.turnoId).subscribe({
        next: (turno) => {
          if (!turno) {
            console.error('No se encontró el turno asociado a la solicitud');
            return;
          }
          this.pacienteService.seleccionarTurno(turno);
          this.router.navigate(['/solicitudes/solicitudes-cambioturno']);
        },
        error: (error) => {
          console.error('Error al obtener el turno:', error);
        },
      });
    }
  }

  
}
