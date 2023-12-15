import { PageNumberPaginationParams } from "./types";

export interface WhitelistItem {
  id: number;
  email: string;
  group: string;
  user: BasicUserDetails | null;
}

export interface BasicUserDetails {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  extra: {
    picture: string;
  };
}

export type WhitelistParams = {
  pagination?: Partial<PageNumberPaginationParams>;
  filters?: {
    search?: string;
    sort?: string;
  };
}

export type CreateWhitelistItemData = Pick<WhitelistItem, "email" | "group">;

export type UpdateWhitelistItemData = Partial<CreateWhitelistItemData>;

export type UserAccess = {
  id: number;
  user: BasicUserDetails;
  last_access: string;
  access: number;
}

export type UserAccessParams = {
  pagination?: Partial<PageNumberPaginationParams>;
  filters?: {
    start_date?: string;
    end_date?: string;
    search?: string;
    sort?: string;
  }
}