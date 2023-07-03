"use client";

import { useState } from "react";
import Link from "next/link";
import { AxiosError } from "axios";
import { FormProvider, useForm } from "react-hook-form";
import Button from "@mui/lab/LoadingButton";

import http from "@/utils/http";
import { requestPasswordReset } from "@/utils/api/auth";
import { TextInput } from "@/components/shared/inputs";

interface PasswordResetRequestData {
  email: string;
}

const PasswordResetRequest = () => {
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const formMethods = useForm<PasswordResetRequestData>({
    mode: "onTouched",
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
      const error = e as AxiosError;
      if (error.response?.status === 400) {
        setError("Ingrese un email válido");
      }
      else {
        setError("Ha ocurrido un problema, por favor intente más tarde")
      }
    }
    finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="text-center">
        <p className="text-lg text-neutral-800 mb-10">
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
            variant="filled"
            type="email"
            placeholder="Correo"
            title="Ingresar correo"
            rules={{
              required: "El correo es necesario",
              pattern: {
                value:
                  /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/,
                message: "Ingrese un email válido",
              },
            }}
            fullWidth
          />

          {error ? (
            <span className="text-red-500 text-sm text-center">{error}</span>
          ) : null}

          <div className="text-center mt-6">
            <Button
              type="submit"
              variant="outlined"
              loading={loading}
              loadingPosition="end"
              endIcon={loading ? <div className="ml-3"></div> : <span></span>}
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
