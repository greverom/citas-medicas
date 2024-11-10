import { UserDto } from "./user.dto";

export interface Diagnostico {
  id?: string;
  pacienteId: string;
  medicoId: string;
  titulo: string;
  fecha: string;
  descripcion: string;
  recomendaciones?: string;
  nombreMedico: string;
}