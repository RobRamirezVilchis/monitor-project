import { useState } from "react";
import type { NextPage } from "next";
import { NextRouter, useRouter } from "next/router";
import { FormProvider, useForm } from "react-hook-form";
import Link from "next/link";
import Button from "@mui/lab/LoadingButton";
import ButtonBase from "@mui/material/ButtonBase";

import { axiosBase as http } from "@/utils/axios";
import { useAuth } from "@/components/auth/useAuth";
import { AuthError } from "@/utils/auth/auth.types";
import { emailPattern, getAuthErrorString } from "@/utils/auth/auth.utils";
import { TextInput } from "@/components/shared/inputs";
import api from "@/utils/api";

import LogoGoogle from "@/../assets/logo-google.svg";

interface BasicLoginData {
  email: string; 
  password: string; 
}

const providers = {
  google: {
    id: "google",
    name: "Google",
  }
};

type Providers = typeof providers;

type ProviderKey = keyof Providers;

type Provider = Providers[ProviderKey];

const Login: NextPage = () => {
  const router = useRouter();
  const { callbackUrl } = router.query;
  const [loading, setLoading] = useState(false);
  const { login, errors } = useAuth({
    skipAll: true,
    triggerAuthentication: false,
  });
  const formMethods = useForm<BasicLoginData>({
    mode: "onTouched",
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const redirectTo = typeof callbackUrl === "string" && callbackUrl 
    ? callbackUrl
    : "/";

  const onSubmit = async (values: BasicLoginData) => {
    setLoading(true);
    try {
      await login({ basicLogin: { 
        username: values.email,
        password: values.password,
      } }, { redirectTo });
    }
    catch (e) { 
      // Errors are handled by the provider and hook
    }
    finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full grid place-items-center">
      <div className="border border-1 rounded-xl p-6">
        <h1 className="text-center font-bold">Login</h1>

        <div className="flex flex-col gap-2">
          <FormProvider {...formMethods}>
            <form
              onSubmit={formMethods.handleSubmit(onSubmit)}
              className="flex flex-col gap-2"
              noValidate // Let hook-form handle the validation
            >
              <TextInput
                name="email"
                variant="filled"
                type="email"
                placeholder="Correo"
                rules={{
                  required: "El correo es necesario",
                  pattern: {
                    value: emailPattern,
                    message: "Ingrese un email válido"
                  },
                }}
                inputProps={{
                  maxLength: 100,
                }}
                fullWidth
              />
              <TextInput
                name="password"
                variant="filled"
                type="password"
                placeholder="Contraseña"
                showPasswordToggle
                rules={{
                  required: "La contraseña es necesaria",
                }}
                inputProps={{
                  maxLength: 150,
                }}
                fullWidth
              />
              {errors ? (
                <span className="text-red-500 text-sm text-center">
                  {errors.includes(AuthError.IncorrectCredentials)
                    ? getAuthErrorString(AuthError.IncorrectCredentials)
                    : getAuthErrorString(errors[errors.length - 1])}
                </span>
              ): null}
              <div className="text-center">
                <Button
                  type="submit"
                  variant="outlined"
                  loading={loading}
                  loadingPosition="end"
                  endIcon={loading ? <div className="ml-3"></div> : <span></span>}
                >
                  Iniciar sesión
                </Button>
              </div>
            </form>
          </FormProvider>
        </div>

        <hr className="my-3" />

        <div>
          {providers ? (
            <div className="flex flex-col gap-1 items-center mt-2 border border-1 rounded-xl">
              {Object.entries(providers).map(([key, provider]) => (
                <ButtonBase
                  key={provider.id}
                  onClick={(_) =>
                    login(
                      { socialLogin: { provider: provider.id } },
                      { redirectTo }
                    )
                  }
                  className="!bg-white !py-2.5 !px-8 !rounded-2xl !flex !gap-3"
                >
                  {getProviderLogo(key as ProviderKey)}
                  <span>Continuar con {provider.name}</span>
                </ButtonBase>
              ))}
            </div>
          ) : null}
          <div className="flex flex-col gap-4 mt-4 z-10">
            <div className="text-center">
              <Link href="/auth/password-reset" className="text-blue-500">
                Olvidé mi contraseña
              </Link>
            </div>
            <div className="text-center">
              <Link href="/auth/register" className="text-blue-500">
                Crear cuenta
              </Link>
            </div>

            <div>
              <button onClick={() => redirectToGoogleAuthentication(router)}>
                Google
              </button>

              <button onClick={async () => {
                const resp = await http.post(api.endpoints.auth.social.google.login, {
                  code: router.query.code
                });
              }}>
                Google 2
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;

function getProviderLogo(provider: keyof Providers) {
  switch (provider) {
    case "google": return <LogoGoogle />;
    default: return null;
  }
}

function redirectToGoogleAuthentication(router: NextRouter) {
  router.push({
    pathname: "https://accounts.google.com/o/oauth2/v2/auth",
    query: {
      client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      redirect_uri: "http://localhost:3000/auth/login",
      response_type: "code",
      scope: "openid profile email",
      prompt: "consent",
    },
  });
}