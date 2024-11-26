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
            const solicitudesConPacientes$ = solicitudes.map((solicitud) =>
              this.pacienteService
                .obtenerPaciente(solicitud.pacienteId)
                .pipe(
                  map((paciente) => ({
                    solicitud,
                    nombrePaciente: paciente
                      ? `${paciente.nombres} ${paciente.apellidos}`
                      : 'Desconocido',
                  }))
                )
            );
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

  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen; 
  }

  verSolicitud(solicitud: SolicitudDto): void {
    if (!solicitud.turnoId || !solicitud.pacienteId) {
      console.error('La solicitud no tiene un turno asociado o el paciente no está definido');
      return;
    }
    this.pacienteService.obtenerTurnoPorId(solicitud.pacienteId, solicitud.turnoId).subscribe({
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
