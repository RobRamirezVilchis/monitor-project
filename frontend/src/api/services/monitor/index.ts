import { 
    UnitStatus,
    UnitHistory,
    DeviceStatus,
    UnitFilters,
} from "./types";
import { Id, Paginated } from "@/api/types";
import { Role, User } from "../auth/types";
import api from "../..";
import http from "@/api/http";

// Safe Driving API ----------------------------------------------------------

export async function getUnits(
    config?: Parameters<typeof http.get>[1]
) {
    try {
        const resp = await http.get<UnitStatus[]>(
            api.endpoints.monitor.drivingStatus, 
            {
                ...config,
            }
        );
        return resp.data;
    } catch (error) {
        throw error;
}
}

export async function getUnitHistory(
    filters?: UnitFilters,
    config?: Parameters<typeof http.get>[1]
) {
    try {
        const resp = await http.get<Paginated<UnitHistory>>(
            api.endpoints.monitor.drivingUnitHistory(filters.name),
            {
                params: filters,
                ...config
            }
        );
        return resp.data;
    } catch (error) {
        throw error;
    }
}


// Industry API ----------------------------------------------------------

export async function getDevices(
    config?: Parameters<typeof http.get>[1]
) {
    try {
        const resp = await http.get<DeviceStatus[]>(
            api.endpoints.monitor.industryStatus, 
            {
                ...config,
            }
        );
        return resp.data;
    } catch (error) {
        throw error;
    }
}