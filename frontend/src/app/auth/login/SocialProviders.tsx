"use client"

import ButtonBase from "@mui/material/ButtonBase";

import { useAuth } from "@/components/auth/useAuth";
import { ProviderKey, Providers } from "@/utils/auth/auth.types";
import { providers } from "@/utils/auth/auth.utils";

import LogoGoogle from "@/../assets/logo-google.svg";

const SocialProviders = () => {
  const { login, errors } = useAuth({
    skipAll: true,
    triggerAuthentication: false,
  });

  const onSocialLogin = async (provider: ProviderKey) => {
    login({ socialLogin: { provider } });
  };

  return (
    <>
      {providers ? (
        <div className="flex flex-col gap-1 items-center mt-2">
          {Object.entries(providers).map(([providerKey, provider]) => (
            <ButtonBase
              key={provider.id}
              onClick={() => onSocialLogin(providerKey as ProviderKey)}
              className="!bg-white !py-2.5 !px-8 !rounded-2xl !flex !gap-3"
              sx={{
                "&.MuiButtonBase-root": {
                  border: "1px solid rgba(0, 0, 0, 0.2)",
                }
              }}
            >
              {getProviderLogo(providerKey as ProviderKey)}
              <span>Continuar con {provider.name}</span>
            </ButtonBase>
          ))}
        </div>
      ) : null}
    </>
  );
}

export default SocialProviders;

function getProviderLogo(provider: keyof Providers) {
  switch (provider) {
    case "google": return <LogoGoogle />;
    default: return null;
  }
}
