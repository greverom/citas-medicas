
import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil} from 'rxjs';
import { Router } from '@angular/router';
import { PacienteService } from '../../../services/pacientes.service';
import { PacienteDto } from '../../../models/user.dto';
import { ModalComponent } from '../../modal/modal.component';
import { Diagnostico } from '../../../models/diagnostico.dto';
import { TratamientoDto } from '../../../models/tratamiento.dto';
import { ModalDto, modalInitializer } from '../../modal/modal.dto';
import { Store } from '@ngrx/store';
import { selectUserData } from '../../../store/user.selector';

@Component({
  selector: 'app-paciente-datos',
  standalone: true,
  imports: [
      CommonModule,
      ModalComponent

  ],
  templateUrl: './paciente-datos.component.html',
  styleUrl: './paciente-datos.component.css'
})
export class PacienteDatosComponent implements OnInit, OnDestroy {
  paciente: PacienteDto | null = null;
  tratamientos: TratamientoDto[] = [];
  private destroy$ = new Subject<void>();
  modal: ModalDto = modalInitializer(); 
  @Output() agendarTurno = new EventEmitter<PacienteDto>();

  constructor(private pacienteService: PacienteService,
              private router: Router,
              private store: Store
  ) {}

  ngOnInit() {
    this.pacienteService.pacienteSeleccionado$
      .pipe(takeUntil(this.destroy$)) 
      .subscribe((paciente) => {
        this.paciente = paciente;
        //console.log('paciente recibido en paciente-datos:', this.paciente);
        if (this.paciente?.id) {
          this.obtenerTratamientos(this.paciente.id);
        }
      });
      this.store.select(selectUserData).subscribe((userData) => {
        if (userData?.id) {
          this.limpiarTurnosPasados(userData.id); 
        }
      });
  }

  ngOnDestroy() {
    this.destroy$.next(); 
    this.destroy$.complete(); 
  }

  emitirAgendarTurno() {
    if (this.paciente) {
      this.agendarTurno.emit(this.paciente);
    }
  }

  agregarDiagnostico() {
    if (this.paciente) {
      this.router.navigate(['/diagnosticos']);
    }
  }

  verDiagnostico(diagnostico: Diagnostico) {
    this.pacienteService.seleccionarDiagnostico(diagnostico);
    this.router.navigate(['/ver-diagnostico']);
  }

  eliminarDiagnostico(diagnosticoId: string) {
    if (this.paciente && this.paciente.id) {
      this.pacienteService.eliminarDiagnostico(this.paciente.id, diagnosticoId).subscribe({
        next: () => {
          //console.log('Diagnóstico eliminado con éxito');
          if (this.paciente?.diagnosticos) {
            this.paciente.diagnosticos = this.paciente.diagnosticos.filter(d => d.id !== diagnosticoId);
          }
          this.cerrarModal();
        },
        error: (error) => {
          console.error('Error al eliminar el diagnóstico:', error);
        }
      });
    }
  }

  eliminarTurno(turnoId: string) {
    if (this.paciente && turnoId) {
      this.pacienteService.eliminarTurno(this.paciente.id!, turnoId).subscribe({
        next: () => {
          this.paciente!.turnos = this.paciente!.turnos!.filter(turno => turno.id !== turnoId);
          this.cerrarModal();
        },
        error: (error) => {
          console.error('Error al eliminar el turno:', error);
        }
      });
    }
  }

  limpiarTurnosPasados(userId: string): void {
    this.pacienteService.eliminarTurnosPasados(userId).subscribe({
      next: () => {
        //console.log('Turnos pasados eliminados correctamente.');
      },
      error: (error) => {
        console.error('Error al eliminar turnos pasados:', error);
      }
    });
  }

  obtenerTratamientos(pacienteId: string) {
    this.pacienteService.obtenerTratamientosPorPaciente(pacienteId).subscribe({
      next: (tratamientos) => {
        this.tratamientos = tratamientos;
        //console.log('Tratamientos del paciente:', this.tratamientos);
      },
      error: (error) => {
        console.error('Error al obtener tratamientos del paciente:', error);
      }
    });
  }

  abrirModalEliminarTratamiento(tratamientoId: string) {
    this.modal = {
      ...modalInitializer(),
      show: true,
      message: '¿Estás seguro de que deseas eliminar este tratamiento?',
      isConfirm: true,
      close: () => this.cerrarModal(),
      confirm: () => this.eliminarTratamiento(tratamientoId)
    };
  }

  eliminarTratamiento(tratamientoId: string) {
    this.pacienteService.eliminarTratamiento(tratamientoId).subscribe({
      next: () => {
        this.tratamientos = this.tratamientos.filter(t => t.id !== tratamientoId);
        this.cerrarModal();
      },
      error: (error) => {
        console.error('Error al eliminar el tratamiento:', error);
        this.cerrarModal();
      }
    });
  }

  obtenerDiaDeLaSemana(fecha: string): string {
    const diasDeLaSemana = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
    const [year, month, day] = fecha.split('-').map(Number);
    const date = new Date(year, month - 1, day); 
    const diaIndex = date.getDay(); 
    return diasDeLaSemana[diaIndex];
  }

  abrirModalEliminarTurno(turnoId: string) {
    this.modal = {
      ...modalInitializer(),
      show: true,
      message: '¿Estás seguro de que deseas eliminar este turno?',
      isConfirm: true,
      close: () => this.cerrarModal(),
      confirm: () => this.eliminarTurno(turnoId)
    };
  }
  
  cerrarModal() {
    this.modal = modalInitializer();
  }
  
  ejecutarAccionConfirmada() {
    console.log('Acción confirmada');
    this.cerrarModal();
  }

  abrirModalEliminarDiagnostico(diagnosticoId: string) {
    this.modal = {
      ...modalInitializer(),
      show: true,
      message: '¿Estás seguro de que deseas eliminar este diagnóstico?',
      isConfirm: true,
      close: () => this.cerrarModal(),
      confirm: () => this.eliminarDiagnostico(diagnosticoId)
    };
  }

  agregarTratamiento() {
    if (this.paciente) {
      this.pacienteService.seleccionarPaciente(this.paciente);
      this.router.navigate(['/tratamientos']);
    }
  }

  verTratamiento(tratamiento: TratamientoDto) {
    this.pacienteService.seleccionarTratamiento(tratamiento);
    this.router.navigate(['/ver-tratamiento']);
  }


}
