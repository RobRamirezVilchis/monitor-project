import { 
  WhitelistItem, 
  WhitelistFilters,
  CreateWhitelistItemData, 
  UpdateWhitelistItemData, 
  UserAccessFilters,
  UserAccess,
  UsersFilters,
  UserUpdateData,
  UserCreateData,
} from "./types";
import { Id, Paginated } from "@/api/types";
import { Role, User } from "../auth/types";
import api from "../..";
import http from "@/api/http";

// Users API ----------------------------------------------------------

export async function getUsers(
  filters?: UsersFilters,
  config?: Parameters<typeof http.get>[1]
) {
  try {
    const resp = await http.get<Paginated<User>>(
      api.endpoints.users.list, 
      {
        params: filters,
        ...config,
      }
    );
    return resp.data;
  } catch (error) {
    throw error;
  }
}

export async function createUser(
  data: UserCreateData,
  config?: Parameters<typeof http.post>[2]
) {
  try {
    const resp = await http.post<User>(
      api.endpoints.users.create,
      data,
      config
    );
    return resp.data;
  } catch (error) {
    throw error;
  }
}

export async function updateUser(
  id: Id,
  data: UserUpdateData,
  config?: Parameters<typeof http.patch>[2]
) {
  try {
    const resp = await http.patch<User>(
      api.endpoints.users.update(id),
      data,
      config
    );
    return resp.data;
  } catch (error) {
    throw error;
  }
}

export async function deleteUser(
  id: Id,
  config?: Parameters<typeof http.delete>[1]
) {
  try {
    const { data } = await http.delete(
      api.endpoints.users.delete(id),
      config
    );
    return data;
  }
  catch (error) {
    throw error;
  }
}

// Roles API -----------------------------------------------------------

export async function getUserRoles(
  config?: Parameters<typeof http.get>[1]
) {
  try {
    const resp = await http.get<Role[]>(
      api.endpoints.users.roles.list,
      config
    );
    return resp.data;
  } catch (error) {
    throw error;
  }
}

// Whitelist API --------------------------------------------------------

export async function getWhitelist(
  filters: WhitelistFilters,
  config?: Parameters<typeof http.get>[1]
) {
  try {
    const resp = await http.get<Paginated<WhitelistItem>>(
      api.endpoints.users.whitelist.list, 
      {
        params: filters,
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
  id: Id,
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
  id: Id,
  config?: Parameters<typeof http.delete>[1]
) {
  try {
    const { data } = await http.delete(
      api.endpoints.users.whitelist.delete(id),
      config
    );
    return data;
  }
  catch (error) {
    throw error;
  }
}

// Users Access API -----------------------------------------------------

export async function getUsersAccess(
  filters: UserAccessFilters,
  config?: Parameters<typeof http.get>[1]
) {
  try {
    const resp = await http.get<Paginated<UserAccess>>(
      api.endpoints.users.access.list, 
      {
        params: filters,
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
    case "User":
      return "Usuario";
    default:
      return "";
  }
}