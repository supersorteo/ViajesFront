export interface Destino {
  id: number;
  nombre: string;
  descripcion: string;
  imagenUrl: string;
  precio: number;
  fechaSalida: string;  // "2025-11-15"
  horaSalida: string;   // "08:00"
  horaLlegada: string;  // "10:30"
  tipo: string;         // "IDA_VUELTA" | "ESPECIAL" | "PREMIUM"
  disponible: boolean;
  totalAsientos: number;
}
