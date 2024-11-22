import { Component, OnInit } from '@angular/core';
import { TurnoDto } from '../../../models/turno.dto';
import { forkJoin, map, Observable, of, switchMap, tap } from 'rxjs';
import { PacienteService } from '../../../services/pacientes.service';
import { Store } from '@ngrx/store';
import { selectUserData } from '../../../store/user.selector';
import { CommonModule } from '@angular/common';
import { SpinnerService } from '../../../services/spinner.service';
import { SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-citas',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './citas.component.html',
  styleUrl: './citas.component.css'
})
export class CitasComponent implements OnInit {
  turnos$: Observable<TurnoDto[]> = of([]);
  turnoSeleccionado: TurnoDto | null = null;
  safeMapUrl: SafeResourceUrl | null = null;
  showNoCitasMessage: boolean = false; 

  constructor(
    private pacienteService: PacienteService,
    private store: Store,
    private spinners: SpinnerService
  ) {}

  ngOnInit(): void {
    this.spinners.show();
    this.turnos$ = this.store.select(selectUserData).pipe(
      switchMap((userData) => {
        const userCedula = userData?.detalles?.cedula;
        if (userCedula) {
          return this.pacienteService.obtenerPacientes().pipe(
            map((pacientes) =>
              pacientes.filter((p) => p.cedula === userCedula)
            ),
            switchMap((pacientes) => {
              if (pacientes.length > 0) {
                const turnosObservables = pacientes.map((paciente) =>
                  this.pacienteService.obtenerTurnosPorPacienteId(paciente.id!)
                );
                return forkJoin(turnosObservables).pipe(
                  map((turnosPorPaciente) => turnosPorPaciente.flat()),
                  tap((turnos) => {
                    //console.log(turnos); 
                  })
                );
              }
              return of([]);
            })
          );
        }
        return of([]);
      }),
      map((result) => {
        this.spinners.hide(); 
        if (result.length === 0) {
          setTimeout(() => {
            this.showNoCitasMessage = true; 
          }, 2000);
        }
        return result;
      })
    );
  }

  seleccionarTurno(turno: TurnoDto): void {
    this.turnoSeleccionado = turno;
    //console.log(turno);
    this.pacienteService.seleccionarTurno(turno);
  }
}
