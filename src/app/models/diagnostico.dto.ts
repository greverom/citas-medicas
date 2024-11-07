import { UserDto } from "./user.dto";

export interface Diagnostico {
    id?: string;
    pacienteId: string;
    medicoId: string;
    fecha: string;
    descripcion: string;
    recomendaciones?: string;
    pacienteInfo?: UserDto;
    medicoInfo?: Partial<UserDto>;
  }