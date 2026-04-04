export type AsientoEstado = 'DISPONIBLE' | 'OCUPADO';

export interface Asiento {
  id: number;
  numero: number;
  estado: AsientoEstado;
  destinoId: number;
}
