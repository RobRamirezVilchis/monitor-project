"use client";

import type { NextPage } from "next";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";

import { useActivateAccountMutation } from "@/api/mutations/auth";

const RegisterActivation: NextPage = () => {
  const [loading, setLoading] = useState(true);
  const [accountVerified, setAccountVerified] = useState(false);
  const requested = useRef(false);
  const activateAccountMutation = useActivateAccountMutation({
    onSuccess: () => setAccountVerified(true),
    onError: () => setAccountVerified(false),
    onSettled: () => setLoading(false),
  });

  const params = useParams();
  const key = params?.["key"] ? decodeURIComponent(params["key"] as string) : null;

  useEffect(() => {
    if (key && !requested.current) {
      requested.current = true;
      setLoading(true);
      activateAccountMutation.mutate({ key });
    }
  }, [activateAccountMutation, key]);

  if (loading) {
    return (
      <div>
        Cargando... por favor no cierre esta página.
      </div>
    );
  }

  if (accountVerified) {
    return (
      <div className="text-center">
        <p className="text-lg mb-10">
          Tu cuenta ha sido verificada con éxito!
          Ya puedes cerrar esta página.
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
        <div className="mb-10">
          <p className="text-lg">
            Ha ocurrido un error con la activación. 
          </p>
          <p className="text-lg">
            Puede que el enlace de activación haya expirado o que
            ya se haya utilizado.
          </p>
        </div>

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

export default RegisterActivation;
