import { Component, OnInit } from '@angular/core';
import { SolicitudDto } from '../../../models/turno.dto';
import { forkJoin, map } from 'rxjs';
import { PacienteService } from '../../../services/pacientes.service';
import { Store } from '@ngrx/store';
import { selectUserData } from '../../../store/user.selector';
import { CommonModule } from '@angular/common';
import { PacienteDto } from '../../../models/user.dto';
import { Router } from '@angular/router';

@Component({
  selector: 'app-solicitudes-turnos',
  standalone: true,
  imports: [ CommonModule],
  templateUrl: './solicitudes-turnos.component.html',
  styleUrl: './solicitudes-turnos.component.css'
})

export class SolicitudesTurnosComponent implements OnInit {
  medicoId: string | null = null; 
  solicitudesTurnos: { solicitud: SolicitudDto; paciente: PacienteDto | null }[] = [];

  constructor(private pacienteService: PacienteService, private store: Store, private router:Router) {}

  ngOnInit(): void {
    this.store.select(selectUserData).subscribe((userData) => {
      this.medicoId = userData?.id ?? null; 

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

  irASolicitudes(): void {
    this.router.navigate(['/solicitudes']);
  }
}
