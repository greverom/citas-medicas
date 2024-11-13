import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { TurnoDto } from '../../models/turno.dto';
import { PacienteService } from '../../services/pacientes.service';
import { Store } from '@ngrx/store';
import { PacienteDto, UserDto } from '../../models/user.dto';
import { selectUserData } from '../../store/user.selector';

@Component({
  selector: 'app-agenda-medico',
  standalone: true,
  imports: [
      CommonModule
  ],
  templateUrl: './agenda-medico.component.html',
  styleUrl: './agenda-medico.component.css'
})
export class AgendaMedicoComponent implements OnInit {
  turnosDelMedico: TurnoDto[] = [];
  daysWithTurnos: number[] = [];
  turnosDelDiaSeleccionado: TurnoDto[] = [];
  selectedDay: number | null = null;
  selectedMonth!: string;
  selectedYear!: number;
  fechaTurnoSeleccionado: { dia: number | null; mes: string | null } = { dia: null, mes: null };
  daysInitials = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
  currentMonthDays: (number | string)[] = []; 
  monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  maxFutureDate!: Date;
  minDate!: Date;
  isModalOpen = false;
  selectedTurno: TurnoDto | null = null;
  selectedPaciente: PacienteDto | null = null;
  notificacionTipo: 'whatsapp' | 'email' | null = null;

  constructor(private pacienteService: PacienteService,
              private store: Store,
  ) {}

  ngOnInit() {
    this.initializeDate();
    this.generateDaysForCurrentMonth();
    this.obtenerTurnosDelMedico();
  }

  esDiaConTurno(day: number | string): boolean {
    return typeof day === 'number' && this.daysWithTurnos.includes(day);
  }

  obtenerTurnosDelMedico(): void {
    this.store.select(selectUserData).subscribe({
        next: (userData: UserDto | null) => {
            const medicoId = userData?.id;
            if (medicoId) {
                const monthIndex = this.monthNames.indexOf(this.selectedMonth);
                const fromDate = new Date(this.selectedYear, monthIndex, 1); 
                const toDate = new Date(this.selectedYear, monthIndex + 1, 0); 
                this.turnosDelMedico = [];
                this.daysWithTurnos = [];
                this.pacienteService.obtenerTurnosDePacientesPorMedico(medicoId).subscribe({
                    next: (turnos) => {
                        turnos.forEach(turno => {
                            const turnoFecha = new Date(turno.fecha + 'T00:00:00'); 
                            if (turnoFecha >= fromDate && turnoFecha <= toDate) {
                                this.pacienteService.obtenerPaciente(turno.pacienteId).subscribe({
                                    next: (paciente: PacienteDto | null) => {
                                        const turnoCompleto = {
                                            ...turno,
                                            nombresPaciente: paciente ? `${paciente.nombres} ${paciente.apellidos}` : 'Paciente no encontrado'
                                        };
                                        this.turnosDelMedico.push(turnoCompleto);
                                        this.daysWithTurnos.push(turnoFecha.getDate()); 
                                    },
                                    error: (error) => console.error('Error al obtener el paciente:', error)
                                });
                            }
                        });
                        this.generateDaysForCurrentMonth(); 
                    },
                    error: (error) => console.error('Error al obtener los turnos del médico:', error)
                });
            }
        },
        error: (error) => console.error('Error al obtener datos del usuario:', error)
    });
}

seleccionarDia(day: number | string): void {
  if (typeof day === 'number') {
    this.selectedDay = day;
    this.turnosDelDiaSeleccionado = this.turnosDelMedico.filter(turno => {
      const turnoFecha = new Date(turno.fecha + 'T00:00:00');
      return (
        turnoFecha.getDate() === day &&
        turnoFecha.getMonth() === this.monthNames.indexOf(this.selectedMonth) &&
        turnoFecha.getFullYear() === this.selectedYear
      );
    });
    if (this.turnosDelDiaSeleccionado.length > 0) {
      this.fechaTurnoSeleccionado = { dia: day, mes: this.selectedMonth };
    }
  }
}

  initializeDate() {
    const today = new Date();
    this.selectedMonth = this.monthNames[today.getMonth()];
    this.selectedYear = today.getFullYear();
    this.maxFutureDate = new Date(today.getFullYear(), today.getMonth() + 2, 1);
    this.minDate = new Date(today.getFullYear(), today.getMonth() - 2, 1);
  }

  generateDaysForCurrentMonth() {
    const monthIndex = this.monthNames.indexOf(this.selectedMonth);
    const daysInMonth = new Date(this.selectedYear, monthIndex + 1, 0).getDate();
    const firstDayOfWeek = new Date(this.selectedYear, monthIndex, 1).getDay();
    const adjustedFirstDay = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
    this.currentMonthDays = Array.from({ length: adjustedFirstDay }, () => '');
    this.currentMonthDays = this.currentMonthDays.concat(
      Array.from({ length: daysInMonth }, (_, i) => i + 1)
    );
  }

  prevMonth() {
    const current = new Date(this.selectedYear, this.monthNames.indexOf(this.selectedMonth), 1);
    current.setMonth(current.getMonth() - 1);

    const today = new Date();
    const minDate = new Date(today.getFullYear(), today.getMonth(), 1);
    if (current >= minDate) {
        this.selectedMonth = this.monthNames[current.getMonth()];
        this.selectedYear = current.getFullYear();
        this.generateDaysForCurrentMonth();
        this.obtenerTurnosDelMedico();
    }
  }

  nextMonth() {
    const current = new Date(this.selectedYear, this.monthNames.indexOf(this.selectedMonth), 1);
    current.setMonth(current.getMonth() + 1);
    
    if (current <= this.maxFutureDate) {
        this.selectedMonth = this.monthNames[current.getMonth()];
        this.selectedYear = current.getFullYear();
        this.generateDaysForCurrentMonth();
        this.obtenerTurnosDelMedico();
    }
  }

  openNotificationModal(turno: TurnoDto, tipo: 'whatsapp' | 'email'): void {
    this.selectedTurno = turno;
    this.isModalOpen = true;
    this.notificacionTipo = tipo; 
  
    this.pacienteService.obtenerPaciente(turno.pacienteId).subscribe({
      next: (paciente: PacienteDto | null) => {
        this.selectedPaciente = paciente;
      },
      error: (error) => console.error('Error al obtener los datos del paciente:', error)
    });
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.selectedTurno = null;
    this.selectedPaciente = null;
  }
}
