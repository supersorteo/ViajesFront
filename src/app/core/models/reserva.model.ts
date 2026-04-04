export interface ReservaRequest {
  destinoId: number;
  numeroAsiento: number;
  nombrePasajero: string;
  email: string;
}

export interface Reserva {
  id: number;
  destino: { id: number; nombre: string };
  numeroAsiento: number;
  nombrePasajero: string;
  email: string;
  estado: 'PENDIENTE' | 'CONFIRMADA' | 'CANCELADA';
}
