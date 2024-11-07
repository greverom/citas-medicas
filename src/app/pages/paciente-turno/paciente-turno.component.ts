import { Component, EventEmitter, Input, Output } from '@angular/core';
import { PacienteDto, UserDto } from '../../models/user.dto';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PacienteService } from '../../services/pacientes.service';
import { EstadoTurno, TurnoDto } from '../../models/turno.dto';

@Component({
  selector: 'app-paciente-turno',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './paciente-turno.component.html',
  styleUrl: './paciente-turno.component.css'
})
export class PacienteTurnoComponent {
  @Input() paciente: PacienteDto | null = null;
  @Input() medicoId: string | null = null;  // Solo el ID del médico
  @Input() medicoNombre: string | null = null;  // Solo el nombre del médico
  @Output() turnoAgendado = new EventEmitter<void>();
  
  fechaSeleccionada: string = '';
  horaSeleccionada: string = '';
  horasDisponibles: string[] = [];

  constructor(private pacienteService: PacienteService) {
    this.horasDisponibles = this.generarHorasDisponibles();
  }

  generarHorasDisponibles(): string[] {
    const horas: string[] = [];
    for (let i = 9; i <= 18; i++) {
      horas.push(`${i}:00`);
    }
    return horas;
  }

  agendarTurno() {
    if (this.fechaSeleccionada && this.horaSeleccionada && this.paciente && this.medicoId && this.medicoNombre) {
      const turno: TurnoDto = {
        id: '',
        pacienteId: this.paciente.id!,
        medicoId: this.medicoId,
        fecha: this.fechaSeleccionada,
        hora: this.horaSeleccionada,
        estado: EstadoTurno.Programado,
        notas: '',
        pacienteInfo: {
          nombres: this.paciente.nombres,
          apellidos: this.paciente.apellidos,
          cedula: this.paciente.cedula,
          correo: this.paciente.correo,
          direccion: this.paciente.direccion
        },
        medicoInfo: { id: this.medicoId, name: this.medicoNombre }
      };
  
      this.pacienteService.agendarTurno(this.paciente.id!, turno).subscribe({
        next: () => {
          console.log('Turno agendado con éxito:', turno);
          this.turnoAgendado.emit();
        },
        error: (error) => {
          console.error('Error al agendar el turno:', error);
        }
      });
    } else {
      console.log('Por favor, selecciona una fecha, una hora, y asegúrate de tener datos del paciente y médico.');
    }
  }
}
