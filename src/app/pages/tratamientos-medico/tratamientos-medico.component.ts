import { Component, OnDestroy, OnInit } from '@angular/core';
import { PacienteDto, UserDto } from '../../models/user.dto';
import { PacienteService } from '../../services/pacientes.service';
import { Store } from '@ngrx/store';
import { selectUserData } from '../../store/user.selector';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TratamientoDto } from '../../models/tratamiento.dto';
import { Router } from '@angular/router';
import { ModalComponent } from '../../components/modal/modal.component';
import { ModalDto, modalInitializer } from '../../components/modal/modal.dto';

@Component({
  selector: 'app-tratamientos-medico',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ModalComponent
  ],
  templateUrl: './tratamientos-medico.component.html',
  styleUrl: './tratamientos-medico.component.css'
})
export class TratamientosMedicoComponent implements OnInit, OnDestroy {
  tratamientoForm!: FormGroup;
  pacientes: PacienteDto[] = [];
  pacienteSeleccionado: PacienteDto | null = null;
  medicoData: Partial<UserDto> | null = null; 
  modal: ModalDto = modalInitializer();

  constructor(private pacienteService: PacienteService,
              private store: Store,
              private fb: FormBuilder,
              private router: Router,) 

  { this.inicializarFormulario();
    
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

  ngOnDestroy(): void {
    this.pacienteService.seleccionarPaciente(null);
  }

  inicializarFormulario() {
    this.tratamientoForm = this.fb.group({
      pacienteId: [{ value: '', disabled: true }],
      medicamentos: this.fb.array([]), 
      notas: ['']
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

  agregarMedicamento() {
    const medicamentoForm = this.fb.group({
      nombre: ['', Validators.required],
      dosis: ['', Validators.required],
      frecuencia: ['', Validators.required]
    });
    this.medicamentos.push(medicamentoForm);
  }

  eliminarMedicamento(index: number): void {
    this.medicamentos.removeAt(index);
  }

  get medicamentos(): FormArray {
    return this.tratamientoForm.get('medicamentos') as FormArray;
  }

  guardarTratamiento() {
    if (this.tratamientoForm.valid && this.pacienteSeleccionado && this.medicoData) {
      const tratamientoData: TratamientoDto = {
        id: '', 
        pacienteId: this.pacienteSeleccionado.id!,
        medicoId: this.medicoData.id!,
        fechaCreacion: new Date().toISOString(),
        medicamentos: this.tratamientoForm.get('medicamentos')?.value || [],
        notas: this.tratamientoForm.get('notas')?.value || ''
      };

      this.pacienteService.agregarTratamiento(tratamientoData).subscribe({
        next: () => {
          //console.log('Tratamiento guardado con éxito');
          this.mostrarModal("Tratamiento guardado exitosamente.", false);
          setTimeout(() => {
            this.router.navigate(['/pacientes']);
          }, 2000);
        },
        error: (error) => {
          //console.error('Error al guardar el tratamiento:', error);
          this.mostrarModal('Error al guardar el tratamiento', true);
        }
      });
    } else {
      console.log('Formulario inválido o faltan datos');
    }
  }

  mostrarModal(mensaje: string, esError: boolean, esConfirmacion: boolean = false, accionConfirmacion?: () => void) {
    this.modal = {
      show: true,
      message: mensaje,
      isError: esError && !esConfirmacion,
      isSuccess: !esError && !esConfirmacion,
      isConfirm: esConfirmacion || false,  
      close: () => this.closeModal(),
      confirm: accionConfirmacion,
    };
  
    if (!esConfirmacion) {
      setTimeout(() => this.closeModal(), 2000);
    }
  }

  closeModal() {
    this.modal = modalInitializer(); 
  }
}
