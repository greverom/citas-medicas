import { Component, OnInit } from '@angular/core';
import { PacienteDto } from '../../models/user.dto';
import { PacienteService } from '../../services/pacientes.service';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil} from 'rxjs';

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

  constructor(private pacienteService: PacienteService) {}

  ngOnInit() {
    this.pacienteService.pacienteSeleccionado$
      .pipe(takeUntil(this.destroy$)) 
      .subscribe((paciente) => {
        this.paciente = paciente;
        console.log('paciente recibido en paciente-datos:', this.paciente);
      });
  }

  ngOnDestroy() {
    this.destroy$.next(); 
    this.destroy$.complete(); 
  }
}
