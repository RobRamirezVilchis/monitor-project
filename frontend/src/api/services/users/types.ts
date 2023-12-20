import { Role } from "../auth/types";
import { Id, PageNumberPaginationParams } from "../../types";

export interface UsersFilters extends Partial<PageNumberPaginationParams> {
  search?: string;
  sort?: string;
}

export interface UserCreateData {
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  roles?: Role[];

  send_mail?: boolean;
}

export interface UserUpdateData {
  first_name?: string;
  last_name?: string;
  roles?: Role[];
}

export interface UserRole {
  id: number;
  name: string;
}

export interface WhitelistItem {
  id: Id;
  email: string;
  group: string;
  user: BasicUserDetails | null;
}

export interface BasicUserDetails {
  id: Id;
  email: string;
  first_name: string;
  last_name: string;
  extra: {
    picture: string;
  };
}

export interface WhitelistFilters extends Partial<PageNumberPaginationParams> {
  search?: string;
  sort?: string;
}

export type CreateWhitelistItemData = Pick<WhitelistItem, "email" | "group">;

export type UpdateWhitelistItemData = Partial<CreateWhitelistItemData>;

export type UserAccess = {
  id: Id;
  user: BasicUserDetails;
  last_access: string;
  access: number;
}

export interface UserAccessFilters extends Partial<PageNumberPaginationParams> {
  start_date?: string;
  end_date?: string;
  search?: string;
  sort?: string;
}