export interface Diagnostico {
    id?: string;
    pacienteId: string;
    medicoId: string;
    fecha: string;
    descripcion: string;
    recomendaciones?: string;
  }