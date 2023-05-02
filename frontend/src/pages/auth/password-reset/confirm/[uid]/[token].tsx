import type { NextPage } from "next"
import { useRouter } from "next/router"
import { useEffect, useState } from "react";
import Link from "next/link";
import { FormProvider, useForm } from "react-hook-form";
import Button from "@mui/lab/LoadingButton";

import { axiosBase as http } from "@/utils/axios";
import { isPasswordResetTokenValid, confirmPasswordReset } from "@/utils/auth/auth.utils";
import { TextInput } from "@/components/shared/inputs";
import logger from "@/utils/logger";

interface PasswordResetData {
  password1: string;
  password2: string;
}

const PasswordResetConfirmation: NextPage = () => {
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);
  const [passwordChanged, setPasswordChanged] = useState<boolean | null>(null);
  const formMethods = useForm<PasswordResetData>({
    mode: "onTouched",
    defaultValues: {
      password1: "",
      password2: "",
    },
  });
  const { getValues, trigger, getFieldState, formState: { touchedFields, isValid } } = formMethods;
  
  const router = useRouter();
  const { uid, token } = router.query;

  useEffect(() => {
    if (uid && token && typeof uid === "string" && typeof token === "string") {
      (async () => {
        const valid = await isPasswordResetTokenValid(http, uid, token);
        setTokenValid(valid);
      })();
    }
  }, [uid, token]);

  const onSubmit = async (values: PasswordResetData) => {
    try {
      if (tokenValid) {
        await confirmPasswordReset(
          http, 
          uid as string, token as string, 
          values.password1, values.password2
        );
        setPasswordChanged(true);
      }
    }
    catch (e) {
      logger.debug("Error", e);
      setPasswordChanged(false);
    }
  };

  if (passwordChanged !== null) {
    if (passwordChanged) {
      return (
        <div className="h-full grid place-items-center">
          <div className="border border-1 rounded-xl p-6">
            <h1 className="text-blue-600 text-2xl capitalize mb-4 text-center">
              Cambio de contraseña
            </h1>

            <div className="text-center">
              <p className="text-lg text-neutral-800 mb-10">
                Tu contraseña se ha cambiado con éxito!
              </p>
        
              <span className="text-sm">
                <Link href="/auth/login" className="font-bold text-blue-500">Iniciar sesión</Link>
              </span>
            </div>
          </div>
        </div>
      );
    }
    else {
      return (
        <div className="h-full grid place-items-center">
          <div className="border border-1 rounded-xl p-6">
            <h1 className="text-blue-600 text-2xl capitalize mb-4 text-center">
              Cambio de contraseña
            </h1>

            <div className="text-center">
              <p className="text-lg text-neutral-800 mb-10">
                Ha ocurrido un error, tu contraseña no ha sido modificada.
              </p>
        
              <span className="text-sm">
                Volver a la página de <Link href="/auth/login" className="font-bold text-blue-500">inicio de sesión</Link>
              </span>
            </div>
          </div>
        </div>
      );
    }
  }

  if (tokenValid === null) {
    return (<div>Cargando...</div>)
  }

  if (!tokenValid) {
    return (
      <div className="h-full grid place-items-center">
        <div className="border border-1 rounded-xl p-6">
          <h1 className="text-blue-600 text-2xl capitalize mb-4 text-center">
            Cambio de contraseña
          </h1>

          <div className="text-center">
            <p className="text-lg text-neutral-800 mb-10">
              El token no es válido o ha caducado.
            </p>
      
            <span className="text-sm">
              Volver a la página de <Link href="/auth/login" className="font-bold text-blue-500">inicio de sesión</Link>
            </span>
          </div>
        </div>
      </div>
    );
  }

  return ( 
    <div className="h-full grid place-items-center">
      <div className="border border-1 rounded-xl p-6">
        <h1 className="text-blue-600 text-2xl capitalize mb-4 text-center">
          Cambio de contraseña
        </h1>

        <FormProvider {...formMethods}>
          <form onSubmit={formMethods.handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            <TextInput
              name="password1"
              type="password"
              rules={{
                required: "Este campo es requerido",
                pattern: {
                  value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/,
                  message: "La contraseña debe tener al menos 8 caracteres, 1 mayúscula y un número"
                }
              }}
              placeholder="Contraseña"
              title="Nueva contraseña"
              fullWidth
              showPasswordToggle
              onChange={() => {
                if (getFieldState("password2").isTouched)
                  trigger("password2");
              }}
            />

            <TextInput
              name="password2"
              type="password"
              rules={{
                validate: {
                  passwordMatch: (value: string) => 
                    value === getValues("password1") || "Las contraseñas no coinciden",
                },
              }}
              placeholder="Confirmar contraseña"
              title="Repetir contraseña"
              fullWidth
              showPasswordToggle
            />
  
            <div className="text-center mt-6">
              <Button
                type="submit"
                variant="outlined"
              >
                Cambiar contraseña
              </Button>
            </div>
          </form>
        </FormProvider>
      </div>
    </div>
  );
}

export default PasswordResetConfirmation;
