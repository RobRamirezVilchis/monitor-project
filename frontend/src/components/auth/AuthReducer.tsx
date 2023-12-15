"use client";

import { ImmerReducer } from "use-immer";

import { ReducerAction as Action } from "@/utils/types";
import { AuthError } from "@/api/services/auth/types";

export interface AuthState {
  loading: boolean;
  errors: AuthError[] | null;
  registeredHooks: number;
}

export type AuthAction = 
  | Action<"loading", boolean>
  | Action<"setErrors", AuthError[] | null>
  | Action<"addError", AuthError>
  | Action<"removeError", AuthError>
  | Action<"clearErrors">
  | Action<"addHook">
  | Action<"removeHook">

export const authReducer: ImmerReducer<AuthState, AuthAction> = (draft, action) => {
  switch (action.type) {
    case "loading":
      if (action.payload === draft.loading) break;
      draft.loading = action.payload;
      break;
    case "setErrors":
      draft.errors = action.payload;
      break;
    case "addError":
      draft.errors = draft.errors || [];
      if (!draft.errors.includes(action.payload))
        draft.errors.push(action.payload);
      break;
    case "removeError":
      draft.errors = draft.errors || [];
      draft.errors = draft.errors.filter((error) => error !== action.payload);
      break;
    case "clearErrors":
      draft.errors = null;
      break;
    case "addHook":
      draft.registeredHooks += 1;
      break;
    case "removeHook":
      draft.registeredHooks -= 1;
      break;
    default:
      break;
  }
}