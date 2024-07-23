import { openCenteredPopupWindow } from "@/utils/window.utils";

export type ProviderKey = typeof providers[number];

export interface ProviderInfo {
  id: string;
  name: string;
}

export type ProvidersInfo = Record<ProviderKey, ProviderInfo>;

export type ProviderOption<P extends ProviderKey, Props = undefined> = {
  [K in P]: Props;
}

export type ProviderUnion<P extends ProviderKey, Payload = undefined> = { 
  provider: P; 
} & Payload;

// ------------------------------------------------------------------------------

export const providers = ["google"] as const;

export const providersInfo: ProvidersInfo = {
  google: {
    id: "google",
    name: "Google",
  },
};

export type ProvidersOptions = 
  & ProviderOption<"google", Omit<google.accounts.oauth2.CodeClientConfig, "callback" | "client_id" | "error_callback">>

export type ProviderResponse =
  | ProviderUnion<"google", google.accounts.oauth2.CodeResponse & { authuser: string; hd: string; prompt: string; }>

export type ProviderErrors = 
  | ProviderUnion<"google", google.accounts.oauth2.ClientConfigError>

export function startSocialLogin(
  provider: ProviderKey, 
  options: {
    providers?: ProvidersOptions;
    callback?: (data: ProviderResponse) => void;
    onPopupClosed?: (error: ProviderErrors) => void;
    onError?: (error: ProviderErrors) => void;
  }
) {
  console.log("client id", process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID)
  switch (provider) {
    case "google":
      // https://developers.google.com/identity/oauth2/web/guides/overview
      const googleOptions = options?.providers?.google;
      google.accounts.oauth2.initCodeClient({
        scope: "openid profile email",
        ux_mode: "popup",
        redirect_uri: process.env.NEXT_PUBLIC_GOOGLE_CALLBACK_URL,
        ...googleOptions,
        callback:(data) => {
          options?.callback?.({
            provider: "google",
            ...data as google.accounts.oauth2.CodeResponse & { authuser: string; hd: string; prompt: string; },
          });
        },
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
        error_callback: (error) => {
          if (error.type === "popup_closed") {
            options?.onPopupClosed?.({
              provider: "google",
              ...error,
            });
          }
          else {
            options?.onError?.({
              provider: "google",
              ...error,
            });
          }
        }
      }).requestCode();
      break;
  }
}

/**
 * @deprecated
 */
function __startSocialLogin(
  provider: ProviderKey, 
  options: {
    callback?: (data: any) => void;
    providers?: ProvidersOptions;
    onPopupClosed?: () => void;
  }
) {
  clearSocialLoginMessageListeners();

  switch (provider) {
    case "google":
      const google = options?.providers?.google;
      const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
      url.search = new URLSearchParams({
        redirect_uri: process.env.NEXT_PUBLIC_GOOGLE_CALLBACK_URL!,
        response_type: "code",
        scope: "openid profile email" + (google?.scope ? " " + google.scope : ""),
        access_type:  "offline",
        prompt: "consent",
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
        ...(google?.login_hint ? { login_hint: google.login_hint } : {}),
      }).toString();
      
      const socialLoginWindow = openCenteredPopupWindow(url, window, "oauth", { width: 500, height: 600 });
      
      if (socialLoginWindow) {
        socialLoginWindow.focus();

        const onChildMessage = (event: MessageEvent<any>) => {
          if (event.origin !== window.location.origin) return;
  
          if (event.data.type === "google-callback") {
            options?.callback?.(event.data.payload);
          }
        };
        
        socialLoginMessageListeners.push(onChildMessage);
        window.addEventListener("message", onChildMessage, false);
        
        const closedCheck = setInterval(() => {
          if (socialLoginWindow.closed) {
            clearInterval(closedCheck);
            clearSocialLoginMessageListeners();
            options?.onPopupClosed?.();
          }
        }, 250);
      }
      break;
  }
}

const socialLoginMessageListeners: Array<(event: MessageEvent<any>) => void> = [];

function clearSocialLoginMessageListeners() {
  let listener = socialLoginMessageListeners.pop();
  while (listener) {
    window.removeEventListener("message", listener);
    listener = socialLoginMessageListeners.pop();
  }
}
