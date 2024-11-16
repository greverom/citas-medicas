import { Component } from '@angular/core';
import { CitasComponent } from '../../components/pacientes/citas/citas.component';
import { CommonModule } from '@angular/common';
import { DiagnosticoComponent } from '../../components/diagnostico/diagnostico.component';
import { DiagnosticosComponent } from '../../components/pacientes/diagnosticos/diagnosticos.component';
import { TratamientosComponent } from "../../components/pacientes/tratamientos/tratamientos.component";

@Component({
  selector: 'app-paciente-servicios',
  standalone: true,
  imports: [
    CommonModule,
    CitasComponent,
    DiagnosticosComponent,
    TratamientosComponent
],
  templateUrl: './paciente-servicios.component.html',
  styleUrl: './paciente-servicios.component.css'
})
export class PacienteServiciosComponent {

}
