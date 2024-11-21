import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { forkJoin, map, Observable, of, switchMap } from 'rxjs';
import { TratamientoDto } from '../../../models/tratamiento.dto';
import { PacienteService } from '../../../services/pacientes.service';
import { Store } from '@ngrx/store';
import { selectUserData } from '../../../store/user.selector';
import { SpinnerService } from '../../../services/spinner.service';

@Component({
  selector: 'app-tratamientos',
  standalone: true,
  imports: [
      CommonModule
  ],
  templateUrl: './tratamientos.component.html',
  styleUrl: './tratamientos.component.css'
})
export class TratamientosComponent implements OnInit {
  tratamientos$: Observable<TratamientoDto[]> = of([]);
  showNoTratamientoMessage:boolean = false

  constructor(private pacienteService: PacienteService, 
              private store: Store,
              private spinners: SpinnerService) {}

          ngOnInit(): void {
            this.spinners.show();
            this.tratamientos$ = this.store.select(selectUserData).pipe(
              switchMap((userData) => {
                const userCedula = userData?.detalles?.cedula;
                if (userCedula) {
                  return this.pacienteService.obtenerPacientes().pipe(
                    map((pacientes) => pacientes.find((p) => p.cedula === userCedula)),
                    switchMap((paciente) => {
                      if (paciente) {
                        return this.pacienteService.obtenerTratamientosPorPaciente(paciente.id!).pipe(
                          switchMap((tratamientos) => {
                            const enrichedTratamientos$ = tratamientos.map((tratamiento) =>
                              this.pacienteService.obtenerMedicoPorId(tratamiento.medicoId).pipe(
                                map((medico) => ({
                                  ...tratamiento,
                                  nombreMedico: medico?.name || 'Médico desconocido',
                                }))
                              )
                            );
                            return forkJoin(enrichedTratamientos$); 
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
                      this.showNoTratamientoMessage = true; 
                    }, 2000);
                  }
                  return result;
                })
            );
          }
}
