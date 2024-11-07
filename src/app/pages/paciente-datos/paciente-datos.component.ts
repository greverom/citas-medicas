import { Component, OnInit } from '@angular/core';
import { PacienteDto } from '../../models/user.dto';
import { PacienteService } from '../../services/pacientes.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-paciente-datos',
  standalone: true,
  imports: [
      CommonModule
  ],
  templateUrl: './paciente-datos.component.html',
  styleUrl: './paciente-datos.component.css'
})
export class PacienteDatosComponent implements OnInit {
  paciente: PacienteDto | null = null;

  constructor(private pacienteService: PacienteService) {}

  ngOnInit() {
    this.pacienteService.pacienteSeleccionado$.subscribe((paciente) => {
      this.paciente = paciente;
      console.log('Paciente recibido en paciente-datos:', this.paciente);
    });
  }
}
