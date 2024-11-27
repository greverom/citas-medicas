import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class HorasDisponiblesService {
  private horasPorMedico: Map<string, string[]> = new Map(); 
  private horasDisponiblesSubject = new BehaviorSubject<string[]>([]);

  horasDisponibles$ = this.horasDisponiblesSubject.asObservable();

  actualizarHorasDisponiblesPorMedico(medicoId: string, horas: string[]) {
    if (!medicoId) {
      return;
    }
    this.horasPorMedico.set(medicoId, horas);
    if (this.horasDisponiblesSubject.observers.length) {
      this.horasDisponiblesSubject.next(horas); 
    }
  }
  
  obtenerHorasDisponiblesPorMedico(medicoId: string): string[] {
    return this.horasPorMedico.get(medicoId) || [];
  }
  
  limpiarHorasDisponibles(medicoId: string) {
    this.horasPorMedico.delete(medicoId);
    if (this.horasDisponiblesSubject.observers.length) {
      this.horasDisponiblesSubject.next([]);
    }
  }

  limpiarEstadoGlobal() {
    this.horasPorMedico.clear(); 
    this.horasDisponiblesSubject.next([]); 
  }
}