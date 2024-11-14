export interface TratamientoDto {
    id: string;
    medicoId: string;
    pacienteId: string; 
    fechaCreacion: string;
    medicamentos: { nombre: string; dosis: string; frecuencia: string }[];
    notas: string;
  }