"use client";

import type { NextPage } from "next"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react";
import Link from "next/link";
import Button from "@mui/lab/LoadingButton";

import http from "@/utils/http";
import { isRegisterTokenValid, verifyAccount } from "@/utils/auth/auth.utils";
import logger from "@/utils/logger";

const RegisterActivation: NextPage = () => {
  const [loading, setLoading] = useState(false);
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);
  const [accountVerified, setAccountVerified] = useState<boolean | null>(null);

  const params = useParams();
  const key = params?.["key"];

  useEffect(() => {
    if (key && typeof key === "string") {
      (async () => {
        const valid = await isRegisterTokenValid(key, { rejectRequest: false, onError: false });
        setTokenValid(valid);
      })();
    }
  }, [key]);

  const handleAccountActivation = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    setLoading(true);
    try {
      if (tokenValid) {
        await verifyAccount(key, { rejectRequest: false, onError: false });
        setAccountVerified(true);
      }
    }
    catch (e) {
      logger.debug("Error", e);
      setAccountVerified(false);
    }
    finally {
      setLoading(false);
    }
  };

  if (accountVerified !== null) {
    if (accountVerified) {
      return (
        <div className="text-center">
          <p className="text-lg text-neutral-800 mb-10">
            Tu cuenta ha sido verificada con éxito!
          </p>
          <span className="text-sm">
            <Link href="/auth/login" className="font-bold text-blue-500">
              Iniciar sesión
            </Link>
          </span>
        </div>
      );
    }
    else {
      return (
        <div className="text-center">
          <p className="text-lg text-neutral-800 mb-10">
            Ha ocurrido un error y tu cuenta no se ha podido activar
            correctamente.
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
    return (<div>Cargando...</div>)
  }

  if (!tokenValid) {
    return (
      <div className="text-center">
        <p className="text-lg text-neutral-800 mb-10">
          El token de activación no es válido o ha caducado.
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
    <div className="text-center">
      <p className="mb-10">
        <Button
          variant="contained"
          onClick={handleAccountActivation}
          loading={loading}
          loadingPosition="end"
          endIcon={loading ? <div className="ml-3"></div> : <span></span>}
        >
          Activar cuenta
        </Button>
      </p>

      <span className="text-sm">
        Ir a la página de{" "}
        <Link href="/auth/login" className="font-bold text-blue-500">
          inicio de sesión
        </Link>
      </span>
    </div>
  );
}

export default RegisterActivation;
