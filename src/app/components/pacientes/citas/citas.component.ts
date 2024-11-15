import { Component, OnInit } from '@angular/core';
import { TurnoDto } from '../../../models/turno.dto';
import { map, Observable, of, switchMap } from 'rxjs';
import { PacienteService } from '../../../services/pacientes.service';
import { Store } from '@ngrx/store';
import { selectUserData } from '../../../store/user.selector';
import { CommonModule } from '@angular/common';

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

  constructor(
    private pacienteService: PacienteService,
    private store: Store
  ) {}

  ngOnInit(): void {
    this.turnos$ = this.store.select(selectUserData).pipe(
      switchMap(userData => {
        const userCedula = userData?.detalles?.cedula;
        if (userCedula) {
          return this.pacienteService.obtenerPacientes().pipe(
            map(pacientes => pacientes.find(p => p.cedula === userCedula)),
            switchMap(paciente =>
              paciente
                ? this.pacienteService.obtenerTurnosPorPacienteId(paciente.id!)
                : of([])
            )
          );
        }
        return of([]); 
      })
    );
  }
}
