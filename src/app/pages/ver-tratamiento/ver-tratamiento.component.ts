import { Component } from '@angular/core';
import { TratamientoDto } from '../../models/tratamiento.dto';
import { CommonModule } from '@angular/common';
import { PacienteService } from '../../services/pacientes.service';
import { PacienteDto } from '../../models/user.dto';

@Component({
  selector: 'app-ver-tratamiento',
  standalone: true,
  imports: [
      CommonModule
  ],
  templateUrl: './ver-tratamiento.component.html',
  styleUrl: './ver-tratamiento.component.css'
})
export class VerTratamientoComponent {
  tratamiento: TratamientoDto | null = null;
  paciente: PacienteDto | null = null;

  constructor(
    private pacienteService: PacienteService
  ) {}

  ngOnInit() {
    this.pacienteService.tratamientoSeleccionado$.subscribe(
      tratamiento => {
        this.tratamiento = tratamiento;
        if (tratamiento && tratamiento.pacienteId) {
          this.obtenerPaciente(tratamiento.pacienteId);
        }
      }
    );
  }

  obtenerPaciente(pacienteId: string) {
    this.pacienteService.obtenerPaciente(pacienteId).subscribe({
      next: (paciente) => {
        this.paciente = paciente;
      },
      error: (error) => console.error('Error al obtener paciente:', error)
    });
  }
}
