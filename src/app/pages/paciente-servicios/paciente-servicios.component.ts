import { Component } from '@angular/core';
import { CitasComponent } from '../../components/pacientes/citas/citas.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-paciente-servicios',
  standalone: true,
  imports: [
    CommonModule,
    CitasComponent
  ],
  templateUrl: './paciente-servicios.component.html',
  styleUrl: './paciente-servicios.component.css'
})
export class PacienteServiciosComponent {

}
