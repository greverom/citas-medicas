import { Component, OnInit } from '@angular/core';
import { Diagnostico } from '../../../models/diagnostico.dto';
import { forkJoin, map, Observable, of, switchMap } from 'rxjs';
import { PacienteService } from '../../../services/pacientes.service';
import { Store } from '@ngrx/store';
import { selectUserData } from '../../../store/user.selector';
import { CommonModule } from '@angular/common';
import { SpinnerService } from '../../../services/spinner.service';

@Component({
  selector: 'app-diagnosticos',
  standalone: true,
  imports: [
      CommonModule
  ],
  templateUrl: './diagnosticos.component.html',
  styleUrl: './diagnosticos.component.css'
})
export class DiagnosticosComponent implements OnInit {
  diagnosticos$: Observable<Diagnostico[]> = of([]);
  showNoDiagnosticoMessage: boolean = false;

  constructor(
    private pacienteService: PacienteService,
    private store: Store,
    private spinners: SpinnerService
  ) {}

  ngOnInit(): void {
    this.spinners.show();
    this.diagnosticos$ = this.store.select(selectUserData).pipe(
      switchMap(userData => {
        const userCedula = userData?.detalles?.cedula;
  
        if (userCedula) {
          return this.pacienteService.obtenerPacientes().pipe(
            map(pacientes =>
              pacientes.filter(paciente => paciente.cedula === userCedula)
            ),
            switchMap(pacientes =>
              pacientes.length > 0
                ? forkJoin(
                    pacientes.map(paciente =>
                      this.pacienteService.obtenerDiagnosticosPorPacienteId(paciente.id!).pipe(
                        map(diagnosticos =>
                          diagnosticos.map(diagnostico => ({
                            ...diagnostico,
                            medicoNombre: paciente.medicoNombre || 'Médico desconocido'
                          }))
                        )
                      )
                    )
                  ).pipe(
                    map((diagnosticosPorPaciente) =>
                      diagnosticosPorPaciente.flat()
                    )
                  )
                : of([]) 
            )
          );
        }
        return of([]); 
      }),
      map((result) => {
        this.spinners.hide(); 
        if (result.length === 0) {
          setTimeout(() => {
            this.showNoDiagnosticoMessage = true; 
          }, 2000);
        }
        return result;
      })
    );
  }
}
