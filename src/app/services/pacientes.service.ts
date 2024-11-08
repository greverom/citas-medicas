import { Injectable } from '@angular/core';
import { Database, ref, set, update, remove, get, child, push } from '@angular/fire/database';
import { PacienteDto } from '../models/user.dto';
import { BehaviorSubject, from, Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { TurnoDto } from '../models/turno.dto';
import { Diagnostico } from '../models/diagnostico.dto';

@Injectable({
  providedIn: 'root',
})
export class PacienteService {
  private dbRef = ref(this.db, 'pacientes');
  private pacienteSeleccionado = new BehaviorSubject<PacienteDto | null>(null);
  pacienteSeleccionado$ = this.pacienteSeleccionado.asObservable();

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

  seleccionarPaciente(paciente: PacienteDto | null) {
    this.pacienteSeleccionado.next(paciente);
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

  agendarTurno(pacienteId: string, turno: TurnoDto): Observable<void> {
    const pacienteRef = child(this.dbRef, pacienteId);

    return from(get(pacienteRef)).pipe(
      switchMap(snapshot => {
        if (snapshot.exists()) {
          const paciente = snapshot.val() as PacienteDto;
          paciente.turnos = paciente.turnos || []; 
          paciente.turnos.push(turno); 
          return from(update(pacienteRef, { turnos: paciente.turnos })); 
        } else {
          throw new Error('Paciente no encontrado');
        }
      }),
      catchError(error => {
        console.error('Error al agendar turno:', error);
        throw error;
      })
    );
  }

  agregarDiagnostico(diagnostico: Diagnostico): Observable<void> {
    const pacienteRef = child(this.dbRef, diagnostico.pacienteId);

    // Obtener el paciente actual para modificar su lista de diagnósticos
    return from(get(pacienteRef)).pipe(
      switchMap(snapshot => {
        const pacienteData = snapshot.val() as PacienteDto;

        // Si el paciente no tiene diagnósticos, creamos el array
        const diagnosticosActualizados = pacienteData.diagnosticos || [];
        diagnosticosActualizados.push(diagnostico);

        // Actualizar el array de diagnósticos en Firebase
        return from(update(pacienteRef, { diagnosticos: diagnosticosActualizados }));
      }),
      catchError(error => {
        console.error('Error al agregar diagnóstico:', error);
        throw error;
      })
    );
  }
}