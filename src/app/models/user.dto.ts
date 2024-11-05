
export interface UserDto {
    id?: string;
    name: string;
    email: string;
    role: UserRole;
    isAdmin: boolean; 
    detalles?: DetallesPaciente | DetallesMedico;
  }

  export enum UserRole {
    Admin = 'admin',
    Medico = 'medico',
    Paciente = 'paciente',
  }

  export interface DetallesPaciente {
    medicoId: string;
    cedula: string;
    fechaNacimiento: string;
    direccion: string;
    telefono: string;
  }
  
  export interface DetallesMedico {
    especialidad: string;
    numeroLicencia: string;
    cedula:string
  }