import { 
    Unit,
    Device,
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
    const resp = await http.get<Unit[]>(
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


// Industry API ----------------------------------------------------------

export async function getDevices(
    config?: Parameters<typeof http.get>[1]
) {
try {
    const resp = await http.get<Device[]>(
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