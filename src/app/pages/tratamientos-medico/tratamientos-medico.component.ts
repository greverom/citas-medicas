import { Component, OnInit } from '@angular/core';
import { PacienteDto, UserDto } from '../../models/user.dto';
import { PacienteService } from '../../services/pacientes.service';
import { Store } from '@ngrx/store';
import { selectUserData } from '../../store/user.selector';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-tratamientos-medico',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './tratamientos-medico.component.html',
  styleUrl: './tratamientos-medico.component.css'
})
export class TratamientosMedicoComponent implements OnInit {
  tratamientoForm: FormGroup;
  pacientes: PacienteDto[] = [];
  pacienteSeleccionado: PacienteDto | null = null;
  medicoData: Partial<UserDto> | null = null; 

  constructor(private pacienteService: PacienteService,
              private store: Store,
              private fb: FormBuilder) {
                this.tratamientoForm = this.fb.group({
                  pacienteId: [{ value: '', disabled: true }],
                  medicamentos: this.fb.array([]), // FormArray para los medicamentos
                  notas: ['']
                });
              }

  ngOnInit(): void {
    this.store.select(selectUserData).subscribe(userData => {
      if (userData && userData.role === 'medico') {
        this.medicoData = { id: userData.id, name: userData.name };
        this.obtenerPacientes();
      }
    });

    this.pacienteService.pacienteSeleccionado$.subscribe((paciente) => {
      this.pacienteSeleccionado = paciente;
      //console.log('Paciente seleccionado:', this.pacienteSeleccionado); 
    });
    
  }

  formatName(nombres: string, apellidos: string): string {
    return `${this.capitalizeInitial(nombres)} ${this.capitalizeInitial(apellidos)}`;
  }

  private capitalizeInitial(text: string): string {
    return text
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  obtenerPacientes(): void {
    if (this.medicoData?.id) {
      this.pacienteService.obtenerPacientesPorMedico(this.medicoData.id).subscribe({
        next: (pacientes) => {
          this.pacientes = pacientes;
          //console.log('Pacientes del médico:', this.pacientes); 
        },
        error: (error) => {
          console.error('Error al obtener pacientes del médico:', error);
        }
      });
    }
  }

  get medicamentos(): FormArray {
    return this.tratamientoForm.get('medicamentos') as FormArray;
  }
}
