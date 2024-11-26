import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-solicitudes',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './solicitudes.component.html',
  styleUrl: './solicitudes.component.css'
})
export class SolicitudesComponent {

  constructor(private router: Router) {}

  irASolicitudesTurnos(): void {
    this.router.navigate(['/solicitudes/solicitud-nuevoturno']);
  }

  toggleVistaSolicitudesCambio(): void {
    this.router.navigate(['/solicitudes/solicitudes-cambioturno']);
  }
}
