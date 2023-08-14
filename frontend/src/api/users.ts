import { 
  WhitelistItem, 
  WhitelistParams,
  CreateWhitelistItemData, 
  UpdateWhitelistItemData, 
  UserAccessParams,
  UserAccess
} from "./users.types";
import http from "@/utils/http";
import api from ".";
import { Paginated } from "@/api/types";
import { Role } from "./auth.types";

// Whitelist API --------------------------------------------------------

export async function getWhitelist(
  data: WhitelistParams,
  config?: Parameters<typeof http.get>[1]
) {
  const params = data ? {
    ...data?.pagination,
    ...data?.filters,
  } : undefined;

  try {
    const resp = await http.get<Paginated<WhitelistItem[]>>(
      api.endpoints.users.whitelist.list, 
      {
        params,
        ...config,
      }
    );
    return resp.data;
  } catch (error) {
    throw error;
  }
}

export async function addToWhitelist(
  data: CreateWhitelistItemData, 
  config?: Parameters<typeof http.post>[2]
) {
  try {
    const resp = await http.post<WhitelistItem>(
      api.endpoints.users.whitelist.create,
      data,
      config
    );
    return resp.data;
  } catch (error) {
    throw error;
  }
}

export async function updateWhitelistItem(
  id: number,
  data: UpdateWhitelistItemData,
  config?: Parameters<typeof http.patch>[2]
) {
  try {
    const resp = await http.patch<WhitelistItem>(
      api.endpoints.users.whitelist.update(id),
      data,
      config
    );
    return resp.data;
  } catch (error) {
    throw error;
  }
}

export async function deleteWhitelistItem(
  id: number,
  config?: Parameters<typeof http.delete>[1]
) {
  try {
    const resp = await http.delete(
      api.endpoints.users.whitelist.delete(id),
      config
    );
    return resp.data;
  }
  catch (error) {
    throw error;
  }
}

// Users Access API -----------------------------------------------------

export async function getUsersAccess(
  data: UserAccessParams,
  config?: Parameters<typeof http.get>[1]
) {
  const params = data ? {
    ...data?.pagination,
    ...data?.filters,
  } : undefined;

  try {
    const resp = await http.get<Paginated<UserAccess[]>>(
      api.endpoints.users.access.list, 
      {
        params,
        ...config,
      }
    );
    return resp.data;
  } catch (error) {
    throw error;
  }
}


export const getUserRoleLocalized = (group: Role) => {
  switch (group) {
    case "Admin": 
      return "Administrador";
  }
}