import { ProviderKey } from "@/utils/auth/auth.types";
import { openCenteredPopupWindow } from "@/utils/window.utils";

const socialLoginMessageListeners: Array<(event: MessageEvent<any>) => void> = [];

export function startSocialLogin(provider: ProviderKey, callback?: (data: any) => void, onPopupClosed?: () => void) {
  clearSocialLoginMessageListeners();

  switch (provider) {
    case "google":
      const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
      url.searchParams.append("redirect_uri", process.env.NEXT_PUBLIC_GOOGLE_CALLBACK_URL!);
      url.searchParams.append("response_type", "code");
      url.searchParams.append("scope", "openid profile email");
      url.searchParams.append("access_type", "offline");
      url.searchParams.append("prompt", "consent");
      url.searchParams.append("client_id", process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!);
      
      const socialLoginWindow = openCenteredPopupWindow(url, window, "oauth", { width: 500, height: 600 });
      
      if (socialLoginWindow) {
        socialLoginWindow.focus();

        const onChildMessage = (event: MessageEvent<any>) => {
          if (event.origin !== window.location.origin) return;
  
          if (event.data.type === "google-callback") {
            callback && callback(event.data.payload);
          }
        };
        
        socialLoginMessageListeners.push(onChildMessage);
        window.addEventListener("message", onChildMessage, false);
        
        const closedCheck = setInterval(() => {
          if (socialLoginWindow.closed) {
            clearInterval(closedCheck);
            clearSocialLoginMessageListeners();
            onPopupClosed?.();
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