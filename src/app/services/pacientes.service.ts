
import { Injectable } from '@angular/core';
import { Database, ref, set, update, remove, get, child, push } from '@angular/fire/database';
import { UserDto, UserRole } from '../models/user.dto';
import { from, Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class PacienteService {
  private dbRef = ref(this.db, 'pacientes');

  constructor(private db: Database) {}

  // Crear un nuevo paciente
  crearPaciente(paciente: UserDto): Observable<void> {
    paciente.role = UserRole.Paciente;
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
  obtenerPacientes(): Observable<UserDto[]> {
    return from(get(this.dbRef)).pipe(
      map(snapshot => {
        if (snapshot.exists()) {
          const pacientesObj = snapshot.val();
          return Object.keys(pacientesObj).map(key => ({
            id: key,
            ...pacientesObj[key],
          }));
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
  obtenerPaciente(id: string): Observable<UserDto | null> {
    const pacienteRef = child(this.dbRef, id);
    return from(get(pacienteRef)).pipe(
      map(snapshot => (snapshot.exists() ? snapshot.val() : null)),
      catchError(error => {
        console.error('Error al obtener paciente:', error);
        return of(null); 
      })
    );
  }

  // Obtener pacientes asociados a un médico específico
  obtenerPacientesPorMedico(medicoId: string): Observable<UserDto[]> {
    return from(get(this.dbRef)).pipe(
      map(snapshot => {
        if (snapshot.exists()) {
          const pacientesObj = snapshot.val();
          return Object.keys(pacientesObj)
            .map(key => ({ id: key, ...pacientesObj[key] }))
            .filter(
              paciente =>
                paciente.detalles &&
                'medicoId' in paciente.detalles &&
                paciente.detalles.medicoId === medicoId
            );
        } else {
          return [];
        }
      }),
      catchError(error => {
        console.error('Error al obtener pacientes del médico:', error);
        return of([]); // Retorna un array vacío en caso de error
      })
    );
  }

  // Actualizar un paciente
  actualizarPaciente(id: string, paciente: UserDto): Observable<void> {
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