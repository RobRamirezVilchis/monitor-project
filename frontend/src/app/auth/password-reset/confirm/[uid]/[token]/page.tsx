"use client";

import { FormProvider, useForm } from "react-hook-form";
import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import Button from "@mui/lab/LoadingButton";
import Link from "next/link";
import z from "zod";

import {
  isPasswordResetTokenValid,
  confirmPasswordReset,
} from "@/api/auth";
import { TextInput } from "@/components/shared/hook-form";
import logger from "@/utils/logger";

const schema = z.object({
  password1: z.string({ required_error: "La contraseña es requerida" }).regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/, 
      "La contraseña debe tener al menos 8 caracteres, 1 mayúscula y un número"
  ),
  password2: z.string(),
}).refine(({password1, password2}) => password1 === password2, {
  message: "Las contraseñas no coinciden",
  path: ["password2"],
});

type PasswordResetData = z.infer<typeof schema>;

const PasswordResetConfirmation = () => {
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);
  const [passwordChanged, setPasswordChanged] = useState<boolean | null>(null);
  const formMethods = useForm<PasswordResetData>({
    mode: "onTouched",
    resolver: zodResolver(schema),
    defaultValues: {
      password1: "",
      password2: "",
    },
  });
  const {
    trigger,
    getFieldState,
    formState: { touchedFields, isValid },
  } = formMethods;

  const params = useParams();
  const uid = params?.["uid"];
  const token = params?.["token"];

  useEffect(() => {
    if (uid && token && typeof uid === "string" && typeof token === "string") {
      (async () => {
        const valid = await isPasswordResetTokenValid(uid, token, { rejectRequest: false, onError: false });
        setTokenValid(valid);
      })();
    }
  }, [uid, token]);

  const onSubmit = useCallback(async (values: PasswordResetData) => {
    try {
      if (tokenValid) {
        await confirmPasswordReset(
          uid as string,
          token as string,
          values.password1,
          values.password2,
          { rejectRequest: false, onError: false }
        );
        setPasswordChanged(true);
      }
    } catch (e) {
      logger.debug("Error", e);
      setPasswordChanged(false);
    }
  }, [uid, token, tokenValid]);

  if (passwordChanged !== null) {
    if (passwordChanged) {
      return (
        <div className="text-center">
          <p className="text-lg text-neutral-800 mb-10">
            Tu contraseña se ha cambiado con éxito!
          </p>

          <span className="text-sm">
            <Link href="/auth/login" className="font-bold text-blue-500">
              Iniciar sesión
            </Link>
          </span>
        </div>
      );
    } else {
      return (
        <div className="text-center">
          <p className="text-lg text-neutral-800 mb-10">
            Ha ocurrido un error, tu contraseña no ha sido modificada.
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
  }

  if (tokenValid === null) {
    return <div>Cargando...</div>;
  }

  if (!tokenValid) {
    return (
      <div className="text-center">
        <p className="text-lg text-neutral-800 mb-10">
          El token no es válido o ha caducado.
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
    <FormProvider {...formMethods}>
      <form
        onSubmit={formMethods.handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
      >
        <TextInput
          name="password1"
          type="password"
          placeholder="Contraseña"
          title="Nueva contraseña"
          fullWidth
          showPasswordToggle
          onChange={() => {
            if (getFieldState("password2").isTouched) trigger("password2");
          }}
        />

        <TextInput
          name="password2"
          type="password"
          placeholder="Confirmar contraseña"
          title="Repetir contraseña"
          fullWidth
          showPasswordToggle
        />

        <div className="text-center mt-6">
          <Button type="submit" variant="outlined">
            Cambiar contraseña
          </Button>
        </div>
      </form>
    </FormProvider>
  );
};

export default PasswordResetConfirmation;
