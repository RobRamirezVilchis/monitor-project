"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { FormProvider, useForm } from "react-hook-form";
import Button from "@mui/lab/LoadingButton";

import { useAuth } from "@/hooks/auth";
import { AuthError } from "@/utils/api/auth.types";
import { emailPattern, getAuthErrorString } from "@/utils/api/auth";
import { TextInput } from "@/components/shared/inputs";

interface BasicLoginData {
  email: string; 
  password: string; 
}

export const LoginForm = () => {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams?.get("callbackUrl");
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

  const redirectTo = useMemo(() => typeof callbackUrl === "string" && callbackUrl 
  ? callbackUrl
  : "/", [callbackUrl]);

  const onSubmit = async (values: BasicLoginData) => {
    setLoading(true);
    try {
      await login({ emailLogin: { 
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
              message: "Ingrese un email válido",
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
        ) : null}
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
  );
}
