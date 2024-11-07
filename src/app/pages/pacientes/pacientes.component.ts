import { Component, OnInit } from '@angular/core';
import { PacienteDto, UserDto } from '../../models/user.dto';
import { selectUserData } from '../../store/user.selector';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { CommonModule } from '@angular/common';
import { PacienteService } from '../../services/pacientes.service';
import { ModalDto, modalInitializer } from '../../components/modal/modal.dto';
import { ModalComponent } from '../../components/modal/modal.component';

@Component({
  selector: 'app-pacientes',
  standalone: true,
  imports: [CommonModule,
            ReactiveFormsModule,
            ModalComponent
  ],
  templateUrl: './pacientes.component.html',
  styleUrl: './pacientes.component.css'
})
export class PacientesComponent implements OnInit {
  pacienteForm: FormGroup;
  editarPacienteForm: FormGroup;
  modalAbierto = false;
  modalEditarAbierto = false;
  medicoData: Partial<UserDto> | null = null;
  mostrarListaPacientes = false;
  pacientes: PacienteDto[] = [];
  modal: ModalDto = modalInitializer(); 
  pacienteAEditar: PacienteDto | null = null;

  constructor(
    private fb: FormBuilder,
    private store: Store,
    private pacienteService: PacienteService
  ) {

    this.pacienteForm = this.fb.group({
      nombres: ['', Validators.required],
      apellidos: ['', Validators.required],
      cedula: ['', Validators.required],
      correo: ['', [Validators.required, Validators.email]],
      direccion: [''],
      telefono: ['']
    });

    this.editarPacienteForm = this.fb.group({
      nombres: ['', Validators.required],
      apellidos: ['', Validators.required],
      direccion: ['']
    });
  }

  ngOnInit() {

    this.store.select(selectUserData).subscribe((userData) => {
      if (userData && userData.role === 'medico') {
        this.medicoData = { id: userData.id, name: userData.name };
        this.obtenerPacientes();
      }
    });
  }

  abrirModal() {
    console.log('Datos del médico en el componente:', this.medicoData);
    this.modalAbierto = true;
  }

  cerrarModal() {
    this.modalAbierto = false;
    this.pacienteForm.reset();
  }

  abrirModalEditar(paciente: PacienteDto) {
    this.pacienteAEditar = paciente;
    this.modalEditarAbierto = true;
    this.editarPacienteForm.patchValue({
      nombres: paciente.nombres,
      apellidos: paciente.apellidos,
      direccion: paciente.direccion
    });
  }

  cerrarModalEditar() {
    this.modalEditarAbierto = false;
    this.pacienteAEditar = null;
  }

  agregarPaciente() {
    if (this.pacienteForm.valid && this.medicoData) {
      const nuevoPaciente: PacienteDto = {
        ...this.pacienteForm.value,
        medicoId: this.medicoData.id,
        medicoNombre: this.medicoData.name,
      };
      this.pacienteService.crearPaciente(nuevoPaciente).subscribe({
        next: () => {
          console.log('Paciente agregado exitosamente:', nuevoPaciente);
          this.pacientes.push(nuevoPaciente);
          this.cerrarModal();
          this.mostrarModal('Paciente agregado exitosamente.', false);
        },
        error: (error) => {
          this.mostrarModal('Error al agregar paciente.', true);
        }
      });
    }
  }

  toggleListaPacientes() {
    this.mostrarListaPacientes = !this.mostrarListaPacientes;
  }

  obtenerPacientes() {
    this.pacienteService.obtenerPacientesPorMedico(this.medicoData?.id ?? '').subscribe({
      next: (pacientes) => {
        this.pacientes = pacientes;
      },
      error: (error) => {
        console.error('Error al obtener pacientes:', error);
      }
    });
  }

  editarPaciente(id: string) {
    if (this.editarPacienteForm.valid && this.pacienteAEditar) {
      const pacienteActualizado = {
        ...this.pacienteAEditar,
        ...this.editarPacienteForm.value
      };
  
      this.pacienteService.actualizarPaciente(id, pacienteActualizado).subscribe({
        next: () => {
          console.log('Paciente actualizado');
          this.mostrarModal('Paciente actualizado exitosamente.', false);
          this.obtenerPacientes(); 
          this.cerrarModalEditar();
        },
        error: (error) => {
          console.error('Error al actualizar paciente:', error);
          this.mostrarModal('Error al actualizar paciente.', true);
        }
      });
    }
  }

  eliminarPaciente(id: string ) {
    this.mostrarModal(
      '¿Estás seguro de que deseas eliminar este paciente?',
      true, 
      true, 
      () => {
        this.pacienteService.eliminarPaciente(id).subscribe({
          next: () => {
            console.log('Paciente eliminado');
            this.mostrarModal('Paciente eliminado exitosamente.', false);
            this.obtenerPacientes(); 
          },
          error: (error) => {
            console.error('Error al eliminar paciente:', error);
            this.mostrarModal('Error al eliminar paciente.', true);
          }
        });
      }
    );
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
