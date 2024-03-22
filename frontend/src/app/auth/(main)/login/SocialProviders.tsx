"use client"

import { Button } from "@mantine/core";

import { useAuth } from "@/hooks/auth";

import LogoGoogle from "@/../assets/logo-google.svg";
import { ProviderKey, providersInfo } from "@/utils/auth/oauth";
import { showErrorNotification } from "@/ui/notifications";

const SocialProviders = () => {
  const { login, errors } = useAuth({
    skipAll: true,
    triggerAuthentication: false,
  });

  const onSocialLogin = async (provider: ProviderKey) => {
    login({ 
      socialLogin: { 
        provider,
        onError: (error) => {
          console.log("An error ocurred", error);
          if (error.provider === "_" && error.type === "authentication_error") {
            showErrorNotification({
              title: "Error de autenticación",
              message: "No se pudo iniciar sesión con el proveedor seleccionado. Por favor intenta de nuevo más tarde.",
            });
          }
          else {
            showErrorNotification({
              title: "Error",
              message: "Ha ocurrido un error. Por favor intenta de nuevo más tarde.",
            });
          }
        },
      },
    });
  };

  return (
    <>
      {providersInfo ? (
        <div className="flex flex-col gap-1 items-center mt-2">
          {Object.entries(providersInfo).map(([providerKey, provider]) => (
            <Button
              key={provider.id}
              onClick={() => onSocialLogin(providerKey as ProviderKey)}
              radius="xl"
              classNames={{
                root: "px-8",
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

function getProviderLogo(provider: ProviderKey) {
  switch (provider) {
    case "google": return <LogoGoogle />;
    default: return null;
  }
}
