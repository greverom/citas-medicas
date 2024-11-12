import { Component, OnInit } from '@angular/core';
import { PacienteDto, UserDto } from '../../models/user.dto';
import { selectUserData } from '../../store/user.selector';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { CommonModule } from '@angular/common';
import { PacienteService } from '../../services/pacientes.service';
import { ModalDto, modalInitializer } from '../../components/modal/modal.dto';
import { ModalComponent } from '../../components/modal/modal.component';
import { PacienteDatosComponent } from '../paciente-datos/paciente-datos.component';
import { PacienteTurnoComponent } from '../paciente-turno/paciente-turno.component';
import { TurnoDto } from '../../models/turno.dto';
import { Diagnostico } from '../../models/diagnostico.dto';
import { cedulaEcuatorianaValidator, CedulaEcuatorianaValidatorDirective } from '../../directives/cedula-ecuatoriana.directive';

@Component({
  selector: 'app-pacientes',
  standalone: true,
  imports: [CommonModule,
            ReactiveFormsModule,
            ModalComponent,
            PacienteDatosComponent,
            PacienteTurnoComponent,
            CedulaEcuatorianaValidatorDirective,
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
  pacientes: PacienteDto[] = [];
  pacientesDelMedico: PacienteDto[] = [];
  modal: ModalDto = modalInitializer(); 
  pacienteAEditar: PacienteDto | null = null;
  modalTurnoAbierto = false; 
  pacienteSeleccionadoParaTurno: PacienteDto | null = null;

  constructor(
    private fb: FormBuilder,
    private store: Store,
    public pacienteService: PacienteService,
  ) {

    this.pacienteForm = this.fb.group({
      nombres: ['', Validators.required],
      apellidos: ['', Validators.required],
      cedula: ['', [Validators.required, Validators.pattern(/^\d+$/), cedulaEcuatorianaValidator()]], 
      correo: ['', [Validators.required, Validators.email]],
      direccion: [''],
      telefono: ['', [Validators.required, Validators.pattern(/^\d+$/)]] 
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

  get nombres() { return this.pacienteForm.get('nombres'); }
  get apellidos() { return this.pacienteForm.get('apellidos'); }
  get cedula() { return this.pacienteForm.get('cedula'); }
  get correo() { return this.pacienteForm.get('correo'); }
  get direccion() { return this.pacienteForm.get('direccion'); }
  get telefono() { return this.pacienteForm.get('telefono'); }

  private marcarCamposComoTocados(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(key => {
        const control = formGroup.get(key);
        control?.markAsTouched();
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

  cargarPacientesDelMedico() {
    const medicoId = 'ID_DEL_MEDICO'; 
    this.pacienteService.obtenerPacientesPorMedico(medicoId).subscribe((pacientes) => {
      this.pacientesDelMedico = pacientes;
    });
  }

  agregarPaciente() {
    if (this.pacienteForm.invalid) {
      this.marcarCamposComoTocados(this.pacienteForm);
      this.mostrarModal('Por favor completa todos los campos obligatorios.', true);
      return;
    }
  
    if (this.medicoData) {
      const nuevoPaciente: PacienteDto = {
        ...this.pacienteForm.value,
        medicoId: this.medicoData.id,
        medicoNombre: this.medicoData.name,
        turnos: [], 
        diagnosticos: [] 
      };
  
      this.pacienteService.crearPaciente(nuevoPaciente).subscribe({
        next: () => {
          this.pacientes.push(nuevoPaciente);
          this.cerrarModal();
          this.mostrarModal('Paciente agregado exitosamente.', false);
        },
        error: (error) => {
          if (error.message.includes('Paciente ya registrado')) {
            this.mostrarModal('Este paciente ya ha sido registrado por usted.', true);
          } else {
            this.mostrarModal('Error al agregar paciente.', true);
          }
        }
      });
    }
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

  seleccionarPaciente(paciente: PacienteDto) {
    this.pacienteService.seleccionarPaciente(paciente);
  }

  cerrarPacienteSeleccionado() {
    this.pacienteService.seleccionarPaciente(null); 
  }

  abrirTurnoPaciente(paciente: PacienteDto) {
    this.pacienteSeleccionadoParaTurno = paciente;
    this.modalTurnoAbierto = true;
  }

  actualizarTurnos(nuevoTurno: TurnoDto) {
    if (this.pacienteSeleccionadoParaTurno) {
      this.pacienteSeleccionadoParaTurno.turnos = [
        ...(this.pacienteSeleccionadoParaTurno.turnos || []),
        nuevoTurno
      ];
  
      this.pacientes = this.pacientes.map(paciente =>
        paciente.id === this.pacienteSeleccionadoParaTurno?.id
          ? { ...paciente, turnos: this.pacienteSeleccionadoParaTurno!.turnos }
          : paciente
      );
    }
  }

  actualizarDiagnosticos(diagnostico: Diagnostico) {
    const pacienteIndex = this.pacientes.findIndex(p => p.id === diagnostico.pacienteId);
    if (pacienteIndex !== -1) {
      this.pacientes[pacienteIndex].diagnosticos = [
        ...(this.pacientes[pacienteIndex].diagnosticos || []),
        diagnostico
      ];
    }
  }

  cerrarModalTurno() {
    this.modalTurnoAbierto = false;
    this.pacienteSeleccionadoParaTurno = null;
  }

  
}
