import { Injectable } from '@angular/core';
import { Database, ref, set, update, remove, get, child, push } from '@angular/fire/database';
import { DetallesMedico, PacienteDto, UserDto } from '../models/user.dto';
import { BehaviorSubject, forkJoin, from, Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { SolicitudDto, TurnoDto } from '../models/turno.dto';
import { Diagnostico } from '../models/diagnostico.dto';
import { TratamientoDto } from '../models/tratamiento.dto';

@Injectable({
  providedIn: 'root',
})
export class PacienteService {
  private tratamientosPath = 'tratamientos';
  private dbRef = ref(this.db, 'pacientes');
  private pacienteSeleccionado = new BehaviorSubject<PacienteDto | null>(null);
  pacienteSeleccionado$ = this.pacienteSeleccionado.asObservable();
  private diagnosticoSeleccionado = new BehaviorSubject<Diagnostico | null>(null);
  diagnosticoSeleccionado$ = this.diagnosticoSeleccionado.asObservable();
  private tratamientoSeleccionado = new BehaviorSubject<TratamientoDto | null>(null);
  tratamientoSeleccionado$: Observable<TratamientoDto | null> = this.tratamientoSeleccionado.asObservable();
  private turnoSeleccionado = new BehaviorSubject<TurnoDto | null>(null);
  turnoSeleccionado$ = this.turnoSeleccionado.asObservable();  
  

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
// Obtener un Medico por ID
  obtenerMedicoPorId(medicoId: string): Observable<Partial<UserDto> | null> {
    const medicoRef = ref(this.db, `usuarios/${medicoId}`);
    return from(get(medicoRef)).pipe(
      map((snapshot) => 
        snapshot.exists() ? snapshot.val() as Partial<UserDto> : null
      ),
      catchError((error) => {
        console.error('Error al obtener médico:', error);
        return of(null);
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

  // Método para obtener los turnos de los pacientes asociados a un médico específico
  obtenerTurnosDePacientesPorMedico(medicoId: string): Observable<TurnoDto[]> {
    return from(get(this.dbRef)).pipe(
      map(snapshot => {
        if (snapshot.exists()) {
          const pacientesObj = snapshot.val();
          const turnos: TurnoDto[] = [];

          Object.keys(pacientesObj).forEach(key => {
            const paciente: PacienteDto = { id: key, ...pacientesObj[key] };
            if (paciente.medicoId === medicoId && paciente.turnos) {
              turnos.push(...paciente.turnos);
            }
          });

          return turnos;
        } else {
          return [];
        }
      }),
      catchError(error => {
        console.error('Error al obtener turnos de pacientes del médico:', error);
        return of([]);
      })
    );
  }

  obtenerTurnoPorId(pacienteId: string, turnoId: string): Observable<TurnoDto | null> {
    const pacienteRef = child(this.dbRef, pacienteId);
  
    return from(get(pacienteRef)).pipe(
      map((snapshot) => {
        if (snapshot.exists()) {
          const paciente = snapshot.val() as PacienteDto;
          const turno = (paciente.turnos || []).find((t) => t.id === turnoId);
          return turno || null;
        } else {
          return null;
        }
      }),
      catchError((error) => {
        console.error('Error al obtener turno:', error);
        return of(null);
      })
    );
  }

  // Método para obtener turnos por pacienteId
obtenerTurnosPorPacienteId(pacienteId: string): Observable<TurnoDto[]> {
  const pacienteRef = child(this.dbRef, pacienteId); 
  
  return from(get(pacienteRef)).pipe(
    map(snapshot => {
      if (snapshot.exists()) {
        const paciente = snapshot.val() as PacienteDto; 
        return paciente.turnos || []; 
      } else {
        return [];
      }
    }),
    catchError(error => {
      console.error('Error al obtener turnos del paciente:', error);
      return of([]); 
    })
  );
}

actualizarFechaHoraTurno(pacienteId: string, turnoId: string, nuevaFecha: string, nuevaHora: string): Observable<void> {
  const pacienteRef = child(this.dbRef, pacienteId);

  return from(get(pacienteRef)).pipe(
    switchMap(snapshot => {
      if (snapshot.exists()) {
        const pacienteData = snapshot.val() as PacienteDto;

        const turnosActualizados = (pacienteData.turnos || []).map(turno =>
          turno.id === turnoId ? { ...turno, fecha: nuevaFecha, hora: nuevaHora } : turno
        );

        return from(update(pacienteRef, { turnos: turnosActualizados }));
      } else {
        throw new Error('Paciente no encontrado');
      }
    }),
    catchError(error => {
      console.error('Error al actualizar turno:', error);
      throw error;
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
    const newTurnoRef = push(ref(this.db, 'turnos')); 
    turno.id = newTurnoRef.key ?? '';

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

  actualizarEstadoTurno(pacienteId: string, turnoId: string, nuevoEstado: string): Observable<void> {
    const pacienteRef = child(this.dbRef, pacienteId);
  
    return from(get(pacienteRef)).pipe(
      switchMap((snapshot) => {
        if (snapshot.exists()) {
          const pacienteData = snapshot.val() as PacienteDto;
          const turnosActualizados = (pacienteData.turnos || []).map((turno) =>
            turno.id === turnoId ? { ...turno, estado: nuevoEstado } : turno
          );
          return from(update(pacienteRef, { turnos: turnosActualizados }));
        } else {
          throw new Error('Paciente no encontrado');
        }
      }),
      catchError((error) => {
        console.error('Error al actualizar el estado del turno:', error);
        throw error;
      })
    );
  }

  crearSolicitud(solicitud: SolicitudDto): Observable<void> {
    const solicitudesRef = ref(this.db, 'solicitudes'); 
    const nuevaSolicitudRef = push(solicitudesRef); 
    solicitud.id = nuevaSolicitudRef.key ?? ''; 
  
    return from(set(nuevaSolicitudRef, solicitud)).pipe(
      catchError(error => {
        console.error('Error al crear la solicitud:', error);
        throw error; 
      })
    );
  }

  obtenerSolicitudesPorMedico(medicoId: string): Observable<SolicitudDto[]> {
    const solicitudesRef = ref(this.db, 'solicitudes'); // Referencia al nodo de solicitudes
  
    return from(get(solicitudesRef)).pipe(
      map((snapshot) => {
        if (snapshot.exists()) {
          const solicitudesObj = snapshot.val();
          return Object.keys(solicitudesObj)
            .map((key) => ({ id: key, ...solicitudesObj[key] }))
            .filter((solicitud: SolicitudDto) => solicitud.medicoId === medicoId);
        } else {
          return []; 
        }
      }),
      catchError((error) => {
        console.error('Error al obtener solicitudes:', error);
        return of([]); // Retorna un array vacío en caso de error
      })
    );
  }

  obtenerSolicitudesPendientesPorMedico(medicoId: string): Observable<SolicitudDto[]> {
    return this.obtenerSolicitudesPorMedico(medicoId).pipe(
      map((solicitudes) => solicitudes.filter((solicitud) => solicitud.estado === 'pendiente'))
    );
  }

  obtenerSolicitudesPorPaciente(pacienteId: string): Observable<SolicitudDto[]> {
    const solicitudesRef = ref(this.db, 'solicitudes');
    return from(get(solicitudesRef)).pipe(
      map((snapshot) => {
        if (snapshot.exists()) {
          const solicitudesObj = snapshot.val();
          const solicitudes = Object.keys(solicitudesObj)
            .map((key) => ({ id: key, ...solicitudesObj[key] }))
            .filter((solicitud: SolicitudDto) => solicitud.pacienteId === pacienteId);
          return solicitudes;
        } else {
          return [];
        }
      }),
      catchError((error) => {
        console.error('Error al obtener solicitudes:', error);
        return of([]); // Si hay un error, devolvemos un array vacío
      })
    );
  }

  actualizarEstadoSolicitud(solicitudId: string, nuevoEstado: string): Observable<void> {
    const solicitudRef = ref(this.db, `solicitudes/${solicitudId}`);
  
    return from(get(solicitudRef)).pipe(
      switchMap((snapshot) => {
        if (snapshot.exists()) {
          return from(update(solicitudRef, { estado: nuevoEstado }));
        } else {
          throw new Error('Solicitud no encontrada');
        }
      }),
      catchError((error) => {
        console.error('Error al actualizar estado de la solicitud:', error);
        throw error;
      })
    );
  }

  verificarSolicitudPendiente(turnoId: string): Observable<boolean> {
    const solicitudesRef = ref(this.db, 'solicitudes'); 
    
    return from(get(solicitudesRef)).pipe(
      map((snapshot) => {
        if (snapshot.exists()) {
          const solicitudesObj = snapshot.val();
          return Object.keys(solicitudesObj)
            .map((key) => solicitudesObj[key])
            .some((solicitud: SolicitudDto) => solicitud.turnoId === turnoId && solicitud.estado === 'pendiente');
        }
        return false; 
      }),
      catchError((error) => {
        console.error('Error al verificar solicitud pendiente:', error);
        return of(false); 
      })
    );
  }

  eliminarSolicitud(solicitudId: string): Observable<void> {
    const solicitudRef = ref(this.db, `solicitudes/${solicitudId}`);
    return from(remove(solicitudRef)).pipe(
      catchError(error => {
        console.error('Error al eliminar la solicitud:', error);
        throw error;
      })
    );
  }

  eliminarTurno(pacienteId: string, turnoId: string): Observable<void> {
    const pacienteRef = child(this.dbRef, pacienteId);
  
    return from(get(pacienteRef)).pipe(
      switchMap(snapshot => {
        if (snapshot.exists()) {
          const pacienteData = snapshot.val() as PacienteDto;
          const turnosActualizados = (pacienteData.turnos || []).filter(turno => turno.id !== turnoId);
          return from(update(pacienteRef, { turnos: turnosActualizados }));
        } else {
          throw new Error('Paciente no encontrado');
        }
      }),
      catchError(error => {
        console.error('Error al eliminar turno:', error);
        throw error;
      })
    );
  }

  eliminarTurnoYSolicitud(pacienteId: string, turnoId: string, solicitudId: string): Observable<void> {
    const pacienteRef = child(this.dbRef, pacienteId);
    const solicitudRef = ref(this.db, `solicitudes/${solicitudId}`);
  
    return from(get(pacienteRef)).pipe(
      switchMap(snapshot => {
        if (snapshot.exists()) {
          const pacienteData = snapshot.val() as PacienteDto;
          const turnosActualizados = (pacienteData.turnos || []).filter(turno => turno.id !== turnoId);
          const updates: { [key: string]: any } = {};
          updates[`pacientes/${pacienteId}/turnos`] = turnosActualizados;
          updates[`solicitudes/${solicitudId}`] = null; 
  
          return from(update(ref(this.db), updates));
        } else {
          throw new Error('Paciente no encontrado');
        }
      }),
      catchError(error => {
        console.error('Error al eliminar turno y solicitud:', error);
        throw error;
      })
    );
  }

  eliminarTurnosPasados(userId: string): Observable<void> {
    return from(get(this.dbRef)).pipe(
      switchMap((snapshot) => {
        if (snapshot.exists()) {
          const pacientesObj = snapshot.val();
          const updates: { [key: string]: any } = {};
  
          Object.keys(pacientesObj).forEach((key) => {
            const paciente: PacienteDto = { id: key, ...pacientesObj[key] };
            if (paciente.medicoId === userId && paciente.turnos) { 
              const turnosFiltrados = paciente.turnos.filter(
                (turno) => new Date(turno.fecha) >= new Date()
              );
  
              updates[`pacientes/${key}/turnos`] = turnosFiltrados; 
            }
          });
  
          return from(update(ref(this.db), updates)); 
        } else {
          return of(); 
        }
      }),
      catchError((error) => {
        console.error('Error al eliminar turnos pasados:', error);
        throw error;
      })
    );
  }

  seleccionarTurno(turno: TurnoDto | null): void {
    this.turnoSeleccionado.next(turno);
  }

  agregarDiagnostico(diagnostico: Diagnostico): Observable<void> {
    const pacienteRef = child(this.dbRef, diagnostico.pacienteId);
    const diagnosticoIdRef = push(ref(this.db, 'diagnosticos'));
    diagnostico.id = diagnosticoIdRef.key ?? '';
    return from(get(pacienteRef)).pipe(
      switchMap(snapshot => {
        const pacienteData = snapshot.val() as PacienteDto;
        const diagnosticosActualizados = pacienteData.diagnosticos || [];
        diagnosticosActualizados.push(diagnostico);
        return from(update(pacienteRef, { diagnosticos: diagnosticosActualizados }));
      }),
      catchError(error => {
        console.error('Error al agregar diagnóstico:', error);
        throw error;
      })
    );
  }

  obtenerDiagnosticosPorPacienteId(pacienteId: string): Observable<Diagnostico[]> {
    const pacienteRef = child(this.dbRef, pacienteId);
  
    return from(get(pacienteRef)).pipe(
      map(snapshot => {
        if (snapshot.exists()) {
          const paciente = snapshot.val() as PacienteDto;
          return paciente.diagnosticos || []; 
        } else {
          return [];
        }
      }),
      catchError(error => {
        console.error('Error al obtener diagnósticos del paciente:', error);
        return of([]); 
      })
    );
  }

  seleccionarDiagnostico(diagnostico: Diagnostico | null) {
    this.diagnosticoSeleccionado.next(diagnostico);
  }

  actualizarDiagnosticos(diagnostico: Diagnostico) {
    const paciente = this.pacienteSeleccionado.value;
    if (paciente) {
      paciente.diagnosticos = [...(paciente.diagnosticos || []), diagnostico];
      this.pacienteSeleccionado.next(paciente); 
    }
  }

  eliminarDiagnostico(pacienteId: string, diagnosticoId: string): Observable<void> {
    const pacienteRef = child(this.dbRef, pacienteId);
    return from(get(pacienteRef)).pipe(
      switchMap(snapshot => {
        const pacienteData = snapshot.val() as PacienteDto;
        const diagnosticosActualizados = (pacienteData.diagnosticos || []).filter(diagnostico => diagnostico.id !== diagnosticoId);
        return from(update(pacienteRef, { diagnosticos: diagnosticosActualizados }));
      }),
      catchError(error => {
        console.error('Error al eliminar diagnóstico:', error);
        throw error;
      })
    );
  }
//Método para agregar un tratamiento
  agregarTratamiento(tratamiento: TratamientoDto): Observable<void> {
    const tratamientoRef = push(ref(this.db, this.tratamientosPath)); 
    tratamiento.id = tratamientoRef.key ?? ''; 
    return from(set(tratamientoRef, tratamiento)).pipe(
      catchError(error => {
        console.error('Error al agregar tratamiento:', error);
        throw error;
      })
    );
  }
  // Método para listar tratamientos de un paciente
obtenerTratamientosPorPaciente(pacienteId: string): Observable<TratamientoDto[]> {
  const tratamientosRef = ref(this.db, 'tratamientos');
  
  return from(get(tratamientosRef)).pipe(
    map(snapshot => {
      if (snapshot.exists()) {
        const tratamientosObj = snapshot.val();
        return Object.keys(tratamientosObj)
          .map(key => ({ id: key, ...tratamientosObj[key] }))
          .filter((tratamiento: TratamientoDto) => tratamiento.pacienteId === pacienteId);
      } else {
        return [];
      }
    }),
    catchError(error => {
      console.error('Error al obtener tratamientos del paciente:', error);
      return of([]); 
    })
  );
}
// Método para eliminar un tratamiento
eliminarTratamiento(tratamientoId: string): Observable<void> {
  const tratamientoRef = ref(this.db, `tratamientos/${tratamientoId}`);
  
  return from(remove(tratamientoRef)).pipe(
    catchError(error => {
      console.error('Error al eliminar el tratamiento:', error);
      throw error;
    })
  );
}
// Método para listar tratamientos de un médico
obtenerTratamientosPorMedico(medicoId: string): Observable<TratamientoDto[]> {
  const tratamientosRef = ref(this.db, 'tratamientos');
  return from(get(tratamientosRef)).pipe(
    map(snapshot => {
      if (snapshot.exists()) {
        const tratamientosObj = snapshot.val();
        return Object.keys(tratamientosObj)
          .map(key => ({
            id: key,
            ...tratamientosObj[key],
          }))
          .filter((tratamiento: TratamientoDto) => tratamiento.medicoId === medicoId);
      } else {
        return [];
      }
    }),
    catchError(error => {
      console.error('Error al obtener tratamientos del médico:', error);
      return of([]); 
    })
  );
}

seleccionarTratamiento(tratamiento: TratamientoDto) {
  this.tratamientoSeleccionado.next(tratamiento);
}

limpiarSeleccion() {
  this.tratamientoSeleccionado.next(null);
}

obtenerPacientePorCedula(cedula: string): Observable<PacienteDto | null> {
  return from(get(this.dbRef)).pipe(
    map((snapshot) => {
      if (snapshot.exists()) {
        const pacientesObj = snapshot.val();
        const pacientes = Object.keys(pacientesObj).map((key) => ({
          id: key,
          ...pacientesObj[key],
        })) as PacienteDto[];

        return pacientes.find((paciente) => paciente.cedula === cedula) || null;
      } else {
        return null; 
      }
    }),
    catchError((error) => {
      console.error('Error al buscar paciente por cédula:', error);
      return of(null);
    })
  );
}

obtenerMedicosAsociadosAPaciente(cedula: string): Observable<(UserDto & { detalles: DetallesMedico })[]> {
  return from(get(this.dbRef)).pipe(
    map((snapshot) => {
      if (snapshot.exists()) {
        const pacientesObj = snapshot.val();
        // Filtrar los registros que coincidan con la cédula
        const pacientes = Object.keys(pacientesObj).map((key) => ({
          id: key,
          ...pacientesObj[key],
        })) as PacienteDto[];
        return pacientes.filter((paciente) => paciente.cedula === cedula);
      }
      return [];
    }),
    switchMap((pacientes) => {
      const medicoIds = Array.from(new Set(pacientes.map((paciente) => paciente.medicoId)));
      const medicosObservables = medicoIds.map((medicoId) =>
        this.obtenerMedicoPorId(medicoId).pipe(
          map((medico) => ({
            ...(medico as UserDto), // Convertir a UserDto
            detalles: medico?.detalles as DetallesMedico, // Convertir detalles a DetallesMedico
          }))
        )
      );
      return forkJoin(medicosObservables);
    }),
    catchError((error) => {
      console.error('Error al obtener médicos asociados al paciente:', error);
      return of([]); // Retornar un array vacío en caso de error
    })
  );
}

}