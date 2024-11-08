import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output} from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PacienteDto } from '../../models/user.dto';
import { Diagnostico } from '../../models/diagnostico.dto';
import { PacienteService } from '../../services/pacientes.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-paciente-diagnostico',
  standalone: true,
  imports: [
      CommonModule,
      ReactiveFormsModule,
      FormsModule
  ],
  templateUrl: './paciente-diagnostico.component.html',
  styleUrl: './paciente-diagnostico.component.css'
})
export class PacienteDiagnosticoComponent implements OnInit {
  paciente: PacienteDto | null = null;
  titulo: string = '';  
  descripcion: string = '';                       
  recomendaciones: string = ''; 

  constructor(private pacienteService: PacienteService, 
              private router: Router) {}

  ngOnInit() {
    this.pacienteService.pacienteSeleccionado$.subscribe((paciente) => {
      this.paciente = paciente;
    });
  }

  agregarDiagnostico() {
    if (this.paciente && this.descripcion) {
      const nuevoDiagnostico: Diagnostico = {
        pacienteId: this.paciente.id!,
        medicoId: this.paciente.medicoId,  
        fecha: new Date().toISOString().split('T')[0], 
        titulo: this.titulo,
        descripcion: this.descripcion,
        recomendaciones: this.recomendaciones
      };

      this.pacienteService.agregarDiagnostico(nuevoDiagnostico).subscribe({
        next: () => {
          this.pacienteService.actualizarDiagnosticos(nuevoDiagnostico);
          this.router.navigate(['/pacientes']); 
        },
        error: (error) => {
          console.error('Error al agregar el diagnóstico:', error);
        }
      });
    } else {
      console.log('Por favor, ingresa una descripción para el diagnóstico.');
    }
  }

  cancelar() {
    this.router.navigate(['/pacientes']); 
  }
}
