import { Component } from '@angular/core';
import { SolicitudDto, TurnoDto } from '../../../models/turno.dto';
import { PacienteService } from '../../../services/pacientes.service';
import { Store } from '@ngrx/store';
import { selectUserData } from '../../../store/user.selector';
import { CommonModule } from '@angular/common';
import { forkJoin, map, switchMap } from 'rxjs';
import { DetallesMedico, DetallesPaciente, UserDto } from '../../../models/user.dto';

@Component({
  selector: 'app-solicitudes-pendientes',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './solicitudes-pendientes.component.html',
  styleUrl: './solicitudes-pendientes.component.css'
})
export class SolicitudesPendientesComponent {
  solicitudesPendientes: { solicitud: SolicitudDto; turno: TurnoDto | null; medico: Partial<UserDto> | null }[] = [];
  pacienteId: string | null = null;

  constructor(
    private pacienteService: PacienteService,
    private store: Store
  ) {}

  ngOnInit(): void {
    this.store.select(selectUserData).subscribe((userData) => {
      if (userData?.detalles && 'cedula' in userData.detalles) {
        const cedula = (userData.detalles as DetallesPaciente).cedula;

        this.pacienteService.obtenerPacientePorCedula(cedula).subscribe((paciente) => {
          if (paciente?.id) {
            this.pacienteId = paciente.id;

            this.pacienteService
              .obtenerSolicitudesPorPaciente(this.pacienteId)
              .pipe(
                switchMap((solicitudes) =>
                  forkJoin(
                    solicitudes.map((solicitud) =>
                      this.pacienteService
                        .obtenerTurnoPorId(solicitud.pacienteId, solicitud.turnoId)
                        .pipe(
                          switchMap((turno) =>
                            this.pacienteService.obtenerMedicoPorId(solicitud.medicoId).pipe(
                              map((medico) => ({
                                solicitud,
                                turno,
                                medico, 
                              }))
                            )
                          )
                        )
                    )
                  )
                )
              )
              .subscribe({
                next: (solicitudesConTurnos) => {
                  this.solicitudesPendientes = solicitudesConTurnos.filter(
                    (detalle) => detalle.solicitud.estado === 'pendiente'
                  );
                  //console.log('Solicitudes pendientes del paciente:', this.solicitudesPendientes);
                },
                error: (error) => console.error('Error al obtener solicitudes:', error),
              });
          }
        });
      } else {
        console.log('No se encontró la cédula del usuario logueado.');
      }
    });
  }

  obtenerEspecialidad(medico: Partial<UserDto> | null): string {
    if (medico?.detalles && 'especialidad' in medico.detalles) {
      const detalles = medico.detalles as DetallesMedico;
      return detalles.especialidad || 'Especialidad no especificada';
    }
    return 'Especialidad no especificada';
  }



}
