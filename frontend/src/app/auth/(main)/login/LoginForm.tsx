"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@mantine/core";
import z from "zod";

import { useAuth } from "@/hooks/auth";
import { AuthError } from "@/api/auth.types";
import { getAuthErrorString } from "@/api/auth";
import { TextInput, PasswordInput } from "@/ui/core";

const schema = z.object({
  email: z.string().email("Ingrese un email válido"),
  password: z.string().min(8, "La contraseña es necesaria (min 8 caracteres)"),
});

type BasicLoginData = z.infer<typeof schema>;

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
    resolver: zodResolver(schema),
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
      await login({ emailLogin: values }, { redirectTo });
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
          control={formMethods.control}
          variant="filled"
          type="email"
          placeholder="Correo"
          maxLength={100}
        />
        <PasswordInput
          name="password"
          control={formMethods.control}
          variant="filled"
          placeholder="Contraseña"
          maxLength={150}
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
            variant="outline"
            loading={loading}
          >
            Iniciar sesión
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
