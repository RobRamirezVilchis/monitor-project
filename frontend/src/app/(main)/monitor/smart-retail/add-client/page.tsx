"use client";

import {
  useAddIndClientMutation,
  useAddSRClientMutation,
} from "@/api/mutations/monitor";
import { NewClientData } from "@/api/services/monitor/types";
import { TextInput } from "@/ui/core";
import { Alert, Button, Loader } from "@mantine/core";

import { ReactNode, useState } from "react";
import { useForm } from "react-hook-form";
import BackArrow from "../../(components)/BackArrow";

const AddSRClientPage = () => {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors },
  } = useForm<NewClientData>({
    defaultValues: {
      name: "",
      keyname: "",
      api_username: "",
      api_password: "",
    },
  });

  const keyname = watch("keyname");

  const addClientMutation = useAddSRClientMutation({
    onSuccess: () => {
      console.log("Success");
      setSuccess(true);
    },
    onError: (error: any, variables, context) => {
      setError(error.response.data["error"]);
    },
  });

  const onSubmit = async (values: NewClientData) => {
    addClientMutation.mutate(values);
    setSuccess(false);
  };
  const loading = addClientMutation.isLoading;

  return (
    <section className="relative">
      <BackArrow />
      <h1 className="mb-8 text-5xl pr-10 ">
        <span className="font-bold ">Smart Retail</span>
        <span className="font-semibold text-gray-400">
          {" "}
          - Agregar nuevo cliente a monitorear
        </span>
      </h1>

      <form className="flex flex-col gap-6" onSubmit={handleSubmit(onSubmit)}>
        <div className="flex gap-2 items-center">
          <p className="text-xl">Nombre del cliente:</p>
          <TextInput
            name="name"
            className="w-64"
            control={control}
            required={true}
          />
        </div>

        <div className="flex gap-10 items-center">
          <div className="flex gap-2 items-center">
            <p className="text-xl">Nombre clave de cliente:</p>
            <TextInput
              className="w-16"
              name="keyname"
              control={control}
              required={true}
            />
          </div>
          {keyname && (
            <div className="flex items-center gap-1">
              <p className="text-lg text-gray-400">
                ( Se buscará en el endpoint {"->"} https://{keyname}
                .retail.aivat.io/ )
              </p>
            </div>
          )}
        </div>
        <div>
          <p className="text-xl font-semibold mb-2">Credenciales de API</p>
          <div className="flex flex-col gap-3 w-fit border-2 rounded-md border-gray-300 dark:border-gray-600 p-4">
            <div className="flex items-center gap-2">
              <p className="text-lg">Nombre de usuario:</p>
              <TextInput
                name="api_username"
                className="w-80"
                control={control}
                required={true}
              />
            </div>

            <div className="flex items-center gap-2">
              <p className="text-lg">Contraseña:</p>
              <TextInput
                name="api_password"
                className="w-80"
                control={control}
                required={true}
              />
            </div>
          </div>
        </div>
        <div className="flex gap-10">
          <Button type="submit" size="lg" color="green">
            Agregar
          </Button>
          {!success && !addClientMutation.isLoading && error && (
            <Alert
              color="red"
              classNames={{ message: "text-red-700" }}
              onClose={() => setError("")}
              withCloseButton
            >
              {error}
            </Alert>
          )}
          {loading && <Loader color="blue"></Loader>}
          {success && (
            <Alert
              color="green"
              classNames={{ message: "text-green-700" }}
              onClose={() => setSuccess(false)}
              withCloseButton
            >
              ¡Cliente agregado con éxito!
            </Alert>
          )}
        </div>
      </form>
    </section>
  );
};

export default AddSRClientPage;
