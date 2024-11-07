import { Injectable } from '@angular/core';
import { Database, ref, set, update, remove, get, child, push } from '@angular/fire/database';
import { PacienteDto } from '../models/user.dto';
import { from, Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class PacienteService {
  private dbRef = ref(this.db, 'pacientes');

  constructor(private db: Database) {}

  // Crear un nuevo paciente
  crearPaciente(paciente: PacienteDto): Observable<void> {
    const newPacienteRef = push(this.dbRef);
    paciente.id = newPacienteRef.key ?? '';

    return from(set(newPacienteRef, paciente)).pipe(
      catchError(error => {
        console.error('Error al crear paciente:', error);
        throw error;
      })
    );
  }

  // Obtener todos los pacientes
  obtenerPacientes(): Observable<PacienteDto[]> {
    return from(get(this.dbRef)).pipe(
      map(snapshot => {
        if (snapshot.exists()) {
          const pacientesObj = snapshot.val();
          return Object.keys(pacientesObj).map(key => ({
            id: key,
            ...pacientesObj[key],
          })) as PacienteDto[];
        } else {
          return [];
        }
      }),
      catchError(error => {
        console.error('Error al obtener pacientes:', error);
        return of([]); 
      })
    );
  }

  // Obtener un paciente por ID
  obtenerPaciente(id: string): Observable<PacienteDto | null> {
    const pacienteRef = child(this.dbRef, id);
    return from(get(pacienteRef)).pipe(
      map(snapshot => (snapshot.exists() ? snapshot.val() as PacienteDto : null)),
      catchError(error => {
        console.error('Error al obtener paciente:', error);
        return of(null); 
      })
    );
  }

  // Obtener pacientes asociados a un médico específico
  obtenerPacientesPorMedico(medicoId: string): Observable<PacienteDto[]> {
    return from(get(this.dbRef)).pipe(
      map(snapshot => {
        if (snapshot.exists()) {
          const pacientesObj = snapshot.val();
          return Object.keys(pacientesObj)
            .map(key => ({ id: key, ...pacientesObj[key] }))
            .filter(
              (paciente: PacienteDto) => paciente.medicoId === medicoId
            );
        } else {
          return [];
        }
      }),
      catchError(error => {
        console.error('Error al obtener pacientes del médico:', error);
        return of([]);
      })
    );
  }

  // Actualizar un paciente
  actualizarPaciente(id: string, paciente: PacienteDto): Observable<void> {
    if (!paciente.id) {
      throw new Error('El paciente debe tener un ID para ser actualizado.');
    }
    const pacienteRef = child(this.dbRef, id);
    return from(update(pacienteRef, paciente)).pipe(
      catchError(error => {
        console.error('Error al actualizar paciente:', error);
        throw error;
      })
    );
  }

  // Eliminar un paciente
  eliminarPaciente(id: string): Observable<void> {
    const pacienteRef = child(this.dbRef, id);
    return from(remove(pacienteRef)).pipe(
      catchError(error => {
        console.error('Error al eliminar paciente:', error);
        throw error;
      })
    );
  }
}