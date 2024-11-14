import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { TratamientoDto } from '../models/tratamiento.dto';
import { BehaviorSubject, Observable } from 'rxjs';
import { PacienteDto } from '../models/user.dto';

@Injectable({
  providedIn: 'root'
})
export class TratamientosService {

  private tratamientosPath = '/tratamientos'; 
  private pacienteSeleccionado = new BehaviorSubject<PacienteDto | null>(null);
  pacienteSeleccionado$ = this.pacienteSeleccionado.asObservable();
  constructor(private db: AngularFireDatabase) {}

  // Método para agregar un tratamiento
  agregarTratamiento(tratamiento: TratamientoDto): Observable<void> {
    const tratamientoRef = this.db.list<TratamientoDto>(this.tratamientosPath);
    tratamiento.id = this.db.createPushId(); 
    return new Observable<void>((observer) => {
      tratamientoRef.set(tratamiento.id, tratamiento)
        .then(() => {
          observer.next();
          observer.complete();
        })
        .catch((error) => observer.error(error));
    });
  }

  // Método para listar tratamientos de un paciente
  obtenerTratamientosPorPaciente(pacienteId: string): Observable<TratamientoDto[]> {
    return this.db.list<TratamientoDto>(this.tratamientosPath, ref =>
      ref.orderByChild('pacienteId').equalTo(pacienteId)
    ).valueChanges();
  }

  // Método para listar tratamientos de un médico específico
obtenerTratamientosPorMedico(medicoId: string): Observable<TratamientoDto[]> {
  return this.db.list<TratamientoDto>(this.tratamientosPath, ref =>
    ref.orderByChild('medicoId').equalTo(medicoId)
  ).valueChanges();
}

  // Método para eliminar un tratamiento
  eliminarTratamiento(tratamientoId: string): Observable<void> {
    return new Observable<void>((observer) => {
      this.db.object(`${this.tratamientosPath}/${tratamientoId}`).remove()
        .then(() => {
          observer.next();
          observer.complete();
        })
        .catch((error) => observer.error(error));
    });
  }
  
}