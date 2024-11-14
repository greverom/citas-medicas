export interface TratamientoDto {
    id: string;
    nombreTratamiento: string;
    medicoId: string;
    pacienteId: string; 
    fechaCreacion: string;
    medicamentos: { nombre: string; dosis: string; frecuencia: string }[];
    notas: string;
  }