"use client";

import { AxiosError } from "axios";
import { FormProvider, useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@mantine/core";
import Link from "next/link";
import z from "zod";

import type { RegisterUserData } from "@/api/auth.types";
import { registerUser } from "@/api/auth";
import { TextInput, PasswordInput, MeteredPasswordInput } from "@/ui/core";
import { showSuccessNotification, showErrorNotification } from "@/ui/notifications";

const schema = z.object({
  first_name: z.string().nonempty("El nombre es requerido"),
  last_name: z.string().nonempty("El apellido es requerido"),
  email: z.string().email("Ingrese un email válido"),
  password1: z.string({ required_error: "La contraseña es requerida" }).regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/, 
    " "
  ),
  password2: z.string(),
}).refine(({password1, password2}) => password1 === password2, {
  message: "Las contraseñas no coinciden",
  path: ["password2"],
});

const Register = () => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const formMethods = useForm<RegisterUserData>({
    mode: "onTouched",
    resolver: zodResolver(schema),
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

        showSuccessNotification({
          title: "Usuario registrado con éxito",
          message: "Se ha enviado un correo de activación al tu bandeja de entrada.",
        });
        router.push("/auth/login");
      } catch (e) {
        const err = e as AxiosError;

        if (err.status === 500) {
          showErrorNotification({
            title: "Error el servidor",
            message: "Por favor intenta de nuevo más tarde.",
          });
          return;
        }

        const errors = err.response?.data as { [key: string]: string[] };
        if (errors?.username) {
          const alreadyExists = errors.username.find((x) =>
            x.includes("already exists")
          );
          if (alreadyExists) {
            showErrorNotification({
              title: "Error al registrar usuario",
              message: "El usuario ya se encuentra registrado.",
            });
            return;
          }
        }
        if (errors?.password1) {
          const commonPassword = errors.password1.find((x) =>
            x.includes("too common")
          );
          if (commonPassword) {
            showErrorNotification({
              title: "Contraseña muy común",
              message: "La contraseña utilizada es muy común y es propensa a ser fácilmente descifrada, por favor intenta con una diferente.",
            });
            return;
          }
        }

        showErrorNotification({
          title: "Credenciales invalidas",
          message: "Los datos ingresados contienen errores, por favor corrígelos.",
        });
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
        <TextInput
          name="first_name"
          control={formMethods.control}
          variant="filled"
          label="Nombre"
          placeholder="Nombre"
          autoComplete="first_name"
          maxLength={150}
        />
        <TextInput
          name="last_name"
          control={formMethods.control}
          variant="filled"
          label="Apellidos"
          placeholder="Apellido(s)"
          autoComplete="last_name"
          maxLength={150}
        />
        <div className="col-span-2">
          <TextInput
            name="email"
            control={formMethods.control}
            variant="filled"
            type="email"
            label="Email"
            placeholder="email@example.com"
            autoComplete="email"
            maxLength={100}
          />
        </div>
        <MeteredPasswordInput
          name="password1"
          control={formMethods.control}
          variant="filled"
          label="Contraseña"
          placeholder="Ingresar contraseña"
          autoComplete="password"
          maxLength={150}
          onChange={() => {
            if (getFieldState("password2").isTouched) trigger("password2");
          }}
          requirements={[
            { pattern: /.{8,}/, label: "8 caracteres" },
            { pattern: /[A-Z]/, label: "1 mayúscula" },
            { pattern: /[a-z]/, label: "1 minúscula" },
            { pattern: /[0-9]/, label: "1 número" },
          ]}
        />
        <PasswordInput
          name="password2"
          control={formMethods.control}
          variant="filled"
          label="Confirmar contraseña"
          placeholder="Confirmar contraseña"
          maxLength={150}
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
          >
            Registrarse
          </Button>
        </div>
      </form>
    </FormProvider>
  );
};

export default Register;
