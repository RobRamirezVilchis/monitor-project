export interface Unit {
    unit: string;
    on_trip: boolean;
    status: string;
    description: string | null;
    last_connection: string | null; 
    pending_events: number | null;
    pending_status: number | null;
  }

export interface Device {
  device: string;
  last_connection: string | null;
  status: string;
  description: string | null;
}