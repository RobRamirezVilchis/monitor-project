"use client"

import { Button } from "@mantine/core";

import { useAuth } from "@/hooks/auth";
import { ProviderKey, Providers } from "@/api/auth.types";
import { providers } from "@/api/auth";

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
            <Button
              key={provider.id}
              onClick={() => onSocialLogin(providerKey as ProviderKey)}
              radius="xl"
              classNames={{
                root: "border-neutral-200 px-8 ",
                section: "!h-2"
              }}
              size="lg"
              variant="outline"
              leftSection={getProviderLogo(providerKey as ProviderKey)}
            >
              <span>Continuar con {provider.name}</span>
            </Button>
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
