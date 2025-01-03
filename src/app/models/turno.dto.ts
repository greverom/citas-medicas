import { DetallesMedico, PacienteDto, UserDto } from "./user.dto";

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
  detallesMedico?: DetallesMedico;
}

  export enum EstadoTurno {
    Programado = 'programado',
    Cancelado = 'suspendido',
  }

  export interface SolicitudDto {
    id: string; 
    pacienteId: string; 
    medicoId: string; 
    turnoId: string; 
    motivo: string; 
    fechaPropuesta?: string; 
    horaPropuesta?: string; 
    estado: 'pendiente' | 'aprobada'; 
    fechaCreacion: string;
  }