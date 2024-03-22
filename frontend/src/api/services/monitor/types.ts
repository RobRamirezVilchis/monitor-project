import { Id, PageNumberPaginationParams } from "../../types";

export interface Unit{
  name: string;
}

export interface Device{
  device_id: number;
}

export interface UnitStatus {
  unit_id: number;
  unit: string;
  on_trip: boolean;
  status: string;
  severity: number;
  description: string | null;
  last_connection: string | null; 
  pending_events: number | null;
  pending_status: number | null;
  client: string;
}

export interface DeviceStatus {
  device_id: number;
  device: string;
  last_connection: string | null;
  delayed: boolean;
  delay_time: string;
  status: string;
  severity: number;
  description: string | null;
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
  severity: number,
  description: string,
}

export interface DeviceHistory {
  device_id: number,
  device: string,
  register_datetime: string,
  last_connection: string,
  severity: number,
  description: string,
  delayed: boolean,
  delay_time: string,
  batch_dropping: number,
  camera_connection: number,
  restart: number,
  license: number,
  shift_change: number,
  others: number,
}

export interface SeverityCount {
  severity: number;
  count: number;
}

export interface Client {
  name: string;
}

export interface LastStatusChange {
  register_datetime: string;
}


export interface UnitFilters extends Partial<PageNumberPaginationParams>{
  unit_id: string;
}

export interface DeviceFilters extends Partial<PageNumberPaginationParams>{
  device_id: string;
}