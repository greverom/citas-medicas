import { Component, OnInit } from '@angular/core';
import { SolicitudDto } from '../../../models/turno.dto';
import { forkJoin, map, Observable, switchMap } from 'rxjs';
import { Store } from '@ngrx/store';
import { PacienteService } from '../../../services/pacientes.service';
import { selectUserData } from '../../../store/user.selector';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-solicitud-turno',
  standalone: true,
  imports: [
      CommonModule
  ],
  templateUrl: './solicitud-turno.component.html',
  styleUrl: './solicitud-turno.component.css'
})
export class SolicitudTurnoComponent implements OnInit {
  medicoId: string | null = null;
  solicitudesDetalladas$: Observable<any[]> | null = null;

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
}
