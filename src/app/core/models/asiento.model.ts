export type AsientoEstado = 'DISPONIBLE' | 'OCUPADO' | 'INACTIVO';

export interface Asiento {
  id: number;
  numero: number;
  estado: AsientoEstado;
  destinoId: number;
}
