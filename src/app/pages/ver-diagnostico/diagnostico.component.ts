import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PacienteService } from '../../services/pacientes.service';
import { Diagnostico } from '../../models/diagnostico.dto';


@Component({
  selector: 'app-diagnostico',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './diagnostico.component.html',
  styleUrl: './diagnostico.component.css'
})
export class DiagnosticoComponent implements OnInit{
  diagnostico: Diagnostico | undefined;

  constructor(private router: Router,
              private pacienteService: PacienteService
  ) {}

  ngOnInit(): void {
    this.pacienteService.diagnosticoSeleccionado$.subscribe((diagnostico) => {
      if (diagnostico) {
        this.diagnostico = diagnostico;
        //console.log(this.diagnostico);
      } else {
        this.router.navigate(['/pacientes']);
      }
    });
  }
}
