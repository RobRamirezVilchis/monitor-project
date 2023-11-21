"use client";

import type { NextPage } from "next";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@mantine/core";
import Link from "next/link";

import { isRegisterTokenValid, verifyAccount } from "@/api/auth";

const RegisterActivation: NextPage = () => {
  const [loading, setLoading] = useState(false);
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);
  const [accountVerified, setAccountVerified] = useState<boolean | null>(null);

  const params = useParams();
  const key = params?.["key"] ? decodeURIComponent(params["key"] as string) : null;

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
      if (tokenValid && key) {
        await verifyAccount(key, { rejectRequest: false, onError: false });
        setAccountVerified(true);
      }
    }
    catch (e) {
      console.error("Error", e);
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
          <p className="text-lg mb-10">
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
          <p className="text-lg mb-10">
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
        <p className="text-lg mb-10">
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
          variant="outline"
          onClick={handleAccountActivation}
          loading={loading}
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
