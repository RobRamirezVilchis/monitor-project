import { Id, PageNumberPaginationParams } from "../../types";

export interface UnitStatus {
    unit: string;
    on_trip: boolean;
    status: string;
    description: string | null;
    last_connection: string | null; 
    pending_events: number | null;
    pending_status: number | null;
  }

export interface UnitHistory {
    unit: string,
    register_datetime: string,
    total: number,
    restart: number,
    reboot: number,
    start: number,
    data_validation: number,
    source_missing: number,
    camera_connection: number
    storage_devices: number,
    forced_reboot: number,
    read_only_ssd: number,
    ignition: number,
    aux: number,
    others: number,
    last_connection: string | null,
    pending_events: number | null,
    pending_status: number | null,
    restarting_loop: Boolean,
    on_trip: boolean,
    status: string,
    description: string,
  }

export interface DeviceStatus {
  device: string;
  last_connection: string | null;
  status: string;
  description: string | null;
}

export interface UnitFilters extends Partial<PageNumberPaginationParams>{
  name: string;
}