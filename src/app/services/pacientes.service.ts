import { Injectable } from '@angular/core';
import { Database, ref, set, update, remove, get, child, push } from '@angular/fire/database';
import { Paciente } from '../models/pacientes';


@Injectable({
  providedIn: 'root',
})
export class PacienteService {
  private dbRef = ref(this.db, 'pacientes');

  constructor(private db: Database) {}

  // Crear un nuevo paciente
  async crearPaciente(paciente: Paciente): Promise<void> {
    try {
      const newPacienteRef = push(this.dbRef);
      paciente.id = newPacienteRef.key || undefined;
      await set(newPacienteRef, paciente);
    } catch (error) {
      console.error('Error al crear paciente:', error);
    }
  }

  // Obtener todos los pacientes
  async obtenerPacientes(): Promise<Paciente[]> {
    try {
      const snapshot = await get(this.dbRef);
      if (snapshot.exists()) {
        const pacientesObj = snapshot.val();
        return Object.keys(pacientesObj).map((key) => ({
          id: key,
          ...pacientesObj[key],
        }));
      } else {
        return [];
      }
    } catch (error) {
      console.error('Error al obtener pacientes:', error);
      return [];
    }
  }

  // Obtener un paciente por ID
  async obtenerPaciente(id: string): Promise<Paciente | null> {
    try {
      const pacienteRef = child(this.dbRef, id);
      const snapshot = await get(pacienteRef);
      if (snapshot.exists()) {
        return snapshot.val();
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error al obtener paciente:', error);
      return null;
    }
  }

  // Actualizar un paciente
  async actualizarPaciente(id: string, paciente: Paciente): Promise<void> {
    if (!paciente.id) {
      throw new Error('El paciente debe tener un ID para ser actualizado.');
    }
    try {
      const pacienteRef = child(this.dbRef, id);
      await update(pacienteRef, paciente);
    } catch (error) {
      console.error('Error al actualizar paciente:', error);
    }
  }

  // Eliminar un paciente
  async eliminarPaciente(id: string): Promise<void> {
    try {
      const pacienteRef = child(this.dbRef, id);
      await remove(pacienteRef);
    } catch (error) {
      console.error('Error al eliminar paciente:', error);
    }
  }
}