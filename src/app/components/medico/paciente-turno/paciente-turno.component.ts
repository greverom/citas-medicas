import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { PacienteDto } from '../../../models/user.dto';
import { EstadoTurno, TurnoDto } from '../../../models/turno.dto';
import { PacienteService } from '../../../services/pacientes.service';
import { selectUserData } from '../../../store/user.selector';

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
export class PacienteTurnoComponent implements OnInit {
  @Input() paciente: PacienteDto | null = null;
  @Input() medicoId: string | null = null;  
  @Output() turnoAgendado = new EventEmitter<TurnoDto>();
  
  fechaMinima: string;
  fechaSeleccionada: string = '';
  horaSeleccionada: string = '';
  horasDisponibles: string[] = [];
  nombreMedico: string = '';
  instrucciones: string = '';

  constructor(private pacienteService: PacienteService,
              private store: Store
  ) {
    this.horasDisponibles = this.generarHorasDisponibles();
    this.store.select(selectUserData).subscribe(userData => {
      if (userData) {
        this.nombreMedico = userData.name; 
      }
    });

    const hoy = new Date();
    hoy.setDate(hoy.getDate() + 1);
    this.fechaMinima = hoy.toISOString().split('T')[0];
    this.fechaSeleccionada = this.fechaMinima;
  }

  ngOnInit() {
    this.setFechaActual();
  }

  setFechaActual() {
    const hoy = new Date();
    hoy.setDate(hoy.getDate() + 1);
    const año = hoy.getFullYear();
    const mes = String(hoy.getMonth() + 1).padStart(2, '0');
    const dia = String(hoy.getDate()).padStart(2, '0');
    this.fechaSeleccionada = `${año}-${mes}-${dia}`;
  }

  generarHorasDisponibles(): string[] {
    const horas: string[] = [];
    for (let i = 9; i <= 18; i++) {
      horas.push(`${i}:00`);
    }
    return horas;
  }

  agendarTurno() {
    if (this.fechaSeleccionada && this.horaSeleccionada && this.paciente && this.medicoId) {
      const turno: TurnoDto = {
        id: '', 
        pacienteId: this.paciente.id!,
        medicoId: this.medicoId,
        fecha: this.fechaSeleccionada,
        hora: this.horaSeleccionada,
        estado: EstadoTurno.Programado, 
        nombreMedico: this.nombreMedico,
        instrucciones: this.instrucciones || ''
      };
      this.pacienteService.agendarTurno(this.paciente.id!, turno).subscribe({
        next: () => {
          //console.log('Turno agendado con éxito:', turno);
          this.turnoAgendado.emit(turno);
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
