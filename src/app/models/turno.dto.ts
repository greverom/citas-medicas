import { PacienteDto, UserDto } from "./user.dto";

export interface TurnoDto {
  id: string;
  pacienteId: string;
  medicoId: string;
  fecha: string;
  hora: string;
  estado: EstadoTurno;
  nombreMedico?: string;
  nombresPaciente?: string;
  instrucciones?: string;
}

  export enum EstadoTurno {
    Programado = 'programado',
    Completado = 'completado',
    Cancelado = 'cancelado',
    NoAsistido = 'no_asistido'
  }