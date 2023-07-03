import { ProviderKey } from "@/utils/api/auth.types";
import { openCenteredPopupWindow } from "@/utils/window.utils";

const socialLoginMessageListeners: Array<(event: MessageEvent<any>) => void> = [];

export interface ProvidersOptions {
  google?: {
    scope?: string;
    prompt?: string;
    access_type?: string;
    login_hint?: string;
  }
}

export function startSocialLogin(
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
        access_type: google?.access_type || "offline",
        prompt: google?.prompt || "consent",
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
        ...(google?.login_hint ? { login_hint: google.login_hint } : {})
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

function clearSocialLoginMessageListeners() {
  let listener = socialLoginMessageListeners.pop();
  while (listener) {
    window.removeEventListener("message", listener);
    listener = socialLoginMessageListeners.pop();
  }
}