import { Component } from '@angular/core';
import { SolicitudDto } from '../../../models/turno.dto';
import { PacienteService } from '../../../services/pacientes.service';
import { Store } from '@ngrx/store';
import { selectUserData } from '../../../store/user.selector';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { forkJoin, map } from 'rxjs';

@Component({
  selector: 'app-notificacion-solicitud',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notificacion-solicitud.component.html',
  styleUrl: './notificacion-solicitud.component.css'
})
export class NotificacionSolicitudComponent {
  solicitudesPendientes: { solicitud: SolicitudDto; nombrePaciente: string }[] = [];
  medicoId: string | null = null;

  constructor(private pacienteService: PacienteService,
               private store: Store,
               private router: Router
  ) {}

  ngOnInit(): void {
    // Obtenemos el ID del médico desde el store
    this.store.select(selectUserData).subscribe((userData) => {
      if (userData?.id) {
        this.medicoId = userData.id;

        this.cargarSolicitudesPendientes();
      }
    });
  }

  cargarSolicitudesPendientes(): void {
    if (!this.medicoId) {
      return;
    }

    this.pacienteService
      .obtenerSolicitudesPendientesPorMedico(this.medicoId)
      .subscribe({
        next: (solicitudes) => {
          if (solicitudes.length > 0) {
            // Obtener los nombres de los pacientes en paralelo
            const solicitudesConPacientes$ = solicitudes.map((solicitud) =>
              this.pacienteService
                .obtenerPaciente(solicitud.pacienteId)
                .pipe(
                  // Combinar la solicitud con el nombre del paciente
                  map((paciente) => ({
                    solicitud,
                    nombrePaciente: paciente
                      ? `${paciente.nombres} ${paciente.apellidos}`
                      : 'Desconocido',
                  }))
                )
            );

            // Ejecutar todas las solicitudes
            forkJoin(solicitudesConPacientes$).subscribe((resultados) => {
              this.solicitudesPendientes = resultados;
            });
          }
        },
        error: (error) => {
          console.error('Error al obtener las solicitudes pendientes:', error);
        },
      });
  }

  verSolicitud(solicitud: SolicitudDto): void {
    if (!solicitud.turnoId || !solicitud.pacienteId) {
      console.error('La solicitud no tiene un turno asociado o el paciente no está definido');
      return;
    }
  
    // Obtener el turno completo desde el servicio
    this.pacienteService.obtenerTurnoPorId(solicitud.pacienteId, solicitud.turnoId).subscribe({
      next: (turno) => {
        if (!turno) {
          console.error('No se encontró el turno asociado a la solicitud');
          return;
        }
  
        // Seleccionar el turno recuperado
        this.pacienteService.seleccionarTurno(turno);
  
        // Redirigir al componente de solicitudes
        this.router.navigate(['/solicitudes']);
      },
      error: (error) => {
        console.error('Error al obtener el turno:', error);
      },
    });
  }
}
