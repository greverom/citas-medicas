
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { PacienteDto } from '../../models/user.dto';
import { PacienteService } from '../../services/pacientes.service';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil} from 'rxjs';
import { Router } from '@angular/router';
import { Diagnostico } from '../../models/diagnostico.dto';
import { ModalDto, modalInitializer } from '../../components/modal/modal.dto';
import { ModalComponent } from '../../components/modal/modal.component';

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
export class PacienteDatosComponent implements OnInit {
  paciente: PacienteDto | null = null;
  private destroy$ = new Subject<void>();
  modal: ModalDto = modalInitializer(); 

  constructor(private pacienteService: PacienteService,
              private router: Router
  ) {}

  ngOnInit() {
    this.pacienteService.pacienteSeleccionado$
      .pipe(takeUntil(this.destroy$)) 
      .subscribe((paciente) => {
        this.paciente = paciente;
        //console.log('paciente recibido en paciente-datos:', this.paciente);
      });
  }

  ngOnDestroy() {
    this.destroy$.next(); 
    this.destroy$.complete(); 
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


}
