"use client";

import React, { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import Button from "@mui/lab/LoadingButton";
import Link from "next/link";

import http from "@/utils/http";
import {
  emailPattern,
  registerUser,
  RegisterUserData,
} from "@/api/auth";
import { TextInput } from "@/components/shared/inputs";
import { useSnackbar } from "@/hooks/shared";

const Register = () => {
  const [loading, setLoading] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const router = useRouter();
  const formMethods = useForm<RegisterUserData>({
    mode: "onTouched",
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      password1: "",
      password2: "",
      username: "",
    },
  });
  const {
    getValues,
    trigger,
    getFieldState,
    formState: { touchedFields, isValid },
  } = formMethods;

  const onSubmit = async (values: RegisterUserData) => {
    setLoading(true);

    if (values) {
      try {
        const data = { ...values, username: values.email };
        await registerUser(data, { rejectRequest: false, onError: false });

        enqueueSnackbar(
          <div>
            <strong className="font-bold">Usuario registrado con éxito</strong>{" "}
            <br />
            <span>
              Se ha enviado un correo de activación al tu bandeja de entrada.
            </span>
          </div>,
          { variant: "success" }
        );
        router.push("/auth/login");
      } catch (e) {
        const err = e as AxiosError;

        if (err.status === 500) {
          enqueueSnackbar(
            "Ha ocurrido un error con el servidor. Por favor intenta de nuevo más tarde.",
            { variant: "error" }
          );
          return;
        }

        const errors = err.response?.data as { [key: string]: string[] };
        if (errors?.username) {
          const alreadyExists = errors.username.find((x) =>
            x.includes("already exists")
          );
          if (alreadyExists) {
            enqueueSnackbar(
              <div>
                <strong className="font-bold">
                  Error al registrar al usuario
                </strong>{" "}
                <br />
                <span>El usuario ya se encuentra registrado.</span>
              </div>,
              { variant: "error" }
            );
            return;
          }
        }
        if (errors?.password1) {
          const commonPassword = errors.password1.find((x) =>
            x.includes("too common")
          );
          if (commonPassword) {
            enqueueSnackbar(
              <div>
                <strong className="font-bold">Contraseña muy común</strong>{" "}
                <br />
                <span>
                  La contraseña utilizada es muy común y es propensa a ser
                  fácilmente descifrada, por favor intenta con una diferente.
                </span>
              </div>,
              { variant: "error" }
            );
            return;
          }
        }

        enqueueSnackbar(
          <div>
            <strong className="font-bold">Credenciales invalidas</strong> <br />
            <span>
              Los datos ingresados contienen errores, por favor corrígelos.
            </span>
          </div>,
          { variant: "error" }
        );
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <FormProvider {...formMethods}>
      <form
        className="flex flex-col gap-6 md:grid grid-cols-2 max-w-5xl"
        onSubmit={formMethods.handleSubmit(onSubmit)}
      >
        <TextInput<RegisterUserData>
          name="first_name"
          variant="filled"
          title="Nombre"
          placeholder="Nombre"
          fullWidth
          autoComplete="first_name"
          rules={{
            required: "Este campo es requerido",
          }}
          inputProps={{
            maxLength: 150,
          }}
        />
        <TextInput<RegisterUserData>
          name="last_name"
          variant="filled"
          title="Apellidos"
          placeholder="Apellido(s)"
          fullWidth
          autoComplete="last_name"
          rules={{
            required: "Este campo es requerido",
          }}
          inputProps={{
            maxLength: 150,
          }}
        />
        <div className="col-span-2">
          <TextInput<RegisterUserData>
            name="email"
            variant="filled"
            type="email"
            title="Email"
            placeholder="email@example.com"
            fullWidth
            autoComplete="email"
            rules={{
              required: "Este campo es requerido",
              pattern: {
                value: emailPattern,
                message: "Ingrese un email válido",
              },
            }}
            inputProps={{
              maxLength: 100,
            }}
          />
        </div>
        <TextInput<RegisterUserData>
          name="password1"
          variant="filled"
          type="password"
          title="Contraseña"
          placeholder="Ingresar contraseña"
          helperText="8 caracteres. Mínimo 1 mayúscula y 1 número"
          showPasswordToggle
          fullWidth
          autoComplete="password"
          rules={{
            required: "Este campo es requerido",
            pattern: {
              value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/,
              message:
                "La contraseña debe tener al menos 8 caracteres, 1 mayúscula y un número",
            },
          }}
          inputProps={{
            maxLength: 150,
          }}
          onChange={() => {
            if (getFieldState("password2").isTouched) trigger("password2");
          }}
        />
        <TextInput<RegisterUserData>
          name="password2"
          variant="filled"
          type="password"
          title="Confirmar contraseña"
          placeholder="Confirmar contraseña"
          showPasswordToggle
          fullWidth
          rules={{
            validate: {
              passwordMatch: (value: string) =>
                value === getValues("password1") ||
                "Las contraseñas no coinciden",
            },
          }}
          inputProps={{
            maxLength: 150,
          }}
        />
        <div className="flex justify-end col-span-2">
          <span className="text-sm self-end">
            Ya tienes una cuenta?{" "}
            <Link href="/auth/login" className="font-bold text-blue-500">
              Inicia sesión
            </Link>
          </span>
          <div className="flex-1"></div>
          <Button
            type="submit"
            variant="outlined"
            disabled={!isValid}
            loading={loading}
            loadingPosition="start"
            startIcon={<span className={loading ? "mr-5" : ""}></span>}
          >
            Registrarse
          </Button>
        </div>
      </form>
    </FormProvider>
  );
};

export default Register;
