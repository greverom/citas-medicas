import { PacienteDto, UserDto } from "./user.dto";

export interface TurnoDto {
    id: string;                  
    pacienteId: string;          
    medicoId: string;            
    fecha: string;               
    hora: string;                
    estado: EstadoTurno;         
    notas?: string;              
    pacienteInfo?: PacienteInfoBasico;
    medicoInfo?: Partial<UserDto>;     
  }

  export interface PacienteInfoBasico {
    nombres: string;
    apellidos: string;
    cedula: string;
    correo: string;
    direccion: string;
  }

  export enum EstadoTurno {
    Programado = 'programado',
    Completado = 'completado',
    Cancelado = 'cancelado',
    NoAsistido = 'no_asistido'
  }