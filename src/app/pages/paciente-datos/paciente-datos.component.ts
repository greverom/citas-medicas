import { Component, OnInit } from '@angular/core';
import { PacienteDto } from '../../models/user.dto';
import { PacienteService } from '../../services/pacientes.service';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil} from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-paciente-datos',
  standalone: true,
  imports: [
      CommonModule
  ],
  templateUrl: './paciente-datos.component.html',
  styleUrl: './paciente-datos.component.css'
})
export class PacienteDatosComponent implements OnInit {
  paciente: PacienteDto | null = null;
  private destroy$ = new Subject<void>();

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

  eliminarDiagnostico(diagnosticoId: string) {
    if (this.paciente && this.paciente.id) {
      this.pacienteService.eliminarDiagnostico(this.paciente.id, diagnosticoId).subscribe({
        next: () => {
          //console.log('Diagnóstico eliminado con éxito');
          if (this.paciente?.diagnosticos) {
            this.paciente.diagnosticos = this.paciente.diagnosticos.filter(d => d.id !== diagnosticoId);
          }
        },
        error: (error) => {
          console.error('Error al eliminar el diagnóstico:', error);
        }
      });
    }
  }


}
