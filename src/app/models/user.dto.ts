import { Diagnostico } from "./diagnostico.dto";
import { TurnoDto } from "./turno.dto";

export interface UserDto {
    id?: string;
    name: string;
    email: string;
    role?: UserRole;
    isAdmin: boolean; 
    detalles?: DetallesPaciente | DetallesMedico;
  }

  export enum UserRole {
    Admin = 'admin',
    Medico = 'medico',
    Paciente = 'paciente',
  }

  export interface DetallesPaciente {
    medicoIds: Partial<UserDto>[];
    cedula: string;
    fechaNacimiento: string;
    direccion: string;
    telefono: string;
    turnos?: TurnoDto[];
    diagnosticos?: Diagnostico[];
  }
  
  export interface DetallesMedico {
    especialidad?: string;
    numeroLicencia: string;
    cedula:string
  }

  export interface PacienteDto {
    id?: string;
    nombres: string;
    apellidos: string;
    cedula: string;
    correo: string;
    direccion: string;
    telefono: string;
    medicoNombre: string;  
    medicoId: string; 
    turnos?: TurnoDto[];  
    diagnosticos?: Diagnostico[];    
  }