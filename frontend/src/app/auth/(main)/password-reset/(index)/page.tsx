"use client";

import { FormProvider, useForm } from "react-hook-form";
import { isAxiosError } from "axios";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@mantine/core";
import Link from "next/link";
import z from "zod";

import { ApiError } from "@/api/types";
import { requestPasswordReset } from "@/api/services/auth";
import { TextInput } from "@/ui/core";

const schema = z.object({
  email: z.string().email("Ingrese un email válido"),
});

type PasswordResetRequestData = z.infer<typeof schema>;

const PasswordResetRequest = () => {
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const formMethods = useForm<PasswordResetRequestData>({
    mode: "onTouched",
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
    },
  });
  const { formState: { touchedFields, isValid } } = formMethods;
  
  const onSubmit = async (values: PasswordResetRequestData) => {
    setLoading(true);
    setError("");

    try {
      await requestPasswordReset(values.email, { rejectRequest: false, onError: false });
      setEmailSent(true);
    }
    catch (e) {
      if (isAxiosError<ApiError>(e)) {
        if (e.response?.data.type === "server_error")
          setError("Ha ocurrido un problema, por favor intente más tarde");
        else if (e.response?.data.type === "validation_error") {
          for (const error of e.response?.data.errors ?? []) {
            if (error.attr === "email") {
              setError("Ingrese un email válido");
            } 
          }
        }
      }
    }
    finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="text-center">
        <p className="text-lg mb-10">
          Se ha enviado correctamente un vínculo para realizar el cambio de
          contraseña al correo ingresado.
        </p>

        <span className="text-sm">
          Volver a la página de{" "}
          <Link href="/auth/login" className="font-bold text-blue-500">
            inicio de sesión
          </Link>
        </span>
      </div>
    );
  }

  return (
    <>
      <FormProvider {...formMethods}>
        <form
          onSubmit={formMethods.handleSubmit(onSubmit)}
          className="flex flex-col gap-4"
          noValidate
        >
          <TextInput
            name="email"
            control={formMethods.control}
            variant="filled"
            type="email"
            placeholder="Correo"
            label="Ingresar correo"
            maxLength={100}
          />

          {error ? (
            <span className="text-red-500 text-sm text-center">{error}</span>
          ) : null}

          <div className="text-center mt-6">
            <Button
              type="submit"
              variant="outline"
              loading={loading}
            >
              Enviar correo
            </Button>
          </div>
        </form>
      </FormProvider>

      <div className="text-center mt-6">
        <span className="text-sm">
          Volver a la página de{" "}
          <Link href="/auth/login" className="font-bold text-blue-500">
            inicio de sesión
          </Link>
        </span>
      </div>
    </>
  );
}

export default PasswordResetRequest;
