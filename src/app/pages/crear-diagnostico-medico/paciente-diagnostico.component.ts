import { CommonModule } from '@angular/common';
import { Component, OnInit} from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PacienteDto, UserDto } from '../../models/user.dto';
import { Diagnostico } from '../../models/diagnostico.dto';
import { PacienteService } from '../../services/pacientes.service';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { selectUserData } from '../../store/user.selector';

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
  userData$: Observable<UserDto | null>;
  nombreMedico: string = '';

  constructor(private pacienteService: PacienteService, 
              private router: Router,
              private store: Store) {
      
    this.userData$ = this.store.select(selectUserData);
  }

  ngOnInit() {
    this.pacienteService.pacienteSeleccionado$.subscribe((paciente) => {
      this.paciente = paciente;
    });

    this.userData$.subscribe(userData => {
      if (userData) {
        this.nombreMedico = userData.name;  
      }
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
        recomendaciones: this.recomendaciones,
        nombreMedico: this.nombreMedico
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
