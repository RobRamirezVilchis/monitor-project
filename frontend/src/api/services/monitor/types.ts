export interface Unit {
    name: string;
    on_trip: boolean;
    status: string;
    description: string | null;
    last_connection: string | null; 

  }