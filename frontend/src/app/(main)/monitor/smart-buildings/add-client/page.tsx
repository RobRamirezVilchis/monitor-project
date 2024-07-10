"use client";

import { useAddIndClientMutation } from "@/api/mutations/monitor";
import { NewClientData } from "@/api/services/monitor/types";
import { TextInput } from "@/ui/core";
import { Alert, Button, Loader } from "@mantine/core";

import { ReactNode, useState } from "react";
import { useForm } from "react-hook-form";
import BackArrow from "../../(components)/BackArrow";
import Breadcrumbs from "../../(components)/Breadcrumbs";

const AddSDClientPage = () => {
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

  const addClientMutation = useAddIndClientMutation({
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
      <Breadcrumbs
        links={[{ href: "/monitor/industry/", name: "Industry" }]}
        pageName="Agregar cliente a monitorear"
      />

      <form
        className="flex flex-col items-center"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="flex flex-col gap-6 border border-gray-300 dark:border-gray-700 p-6 rounded-xl max-w-[460px]">
          <div className="flex flex-col gap-1 ">
            <p className="text-xl">Nombre del cliente:</p>
            <TextInput name="name" control={control} required={true} />
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex gap-2 items-center">
              <p className="text-xl">Nombre clave de cliente:</p>
              <TextInput name="keyname" control={control} required={true} />
            </div>
            <div className="relative">
              {keyname && (
                <div className="flex items-center gap-1">
                  <p className="text-lg text-gray-400 break-all">
                    Se buscará en el endpoint https://{keyname}
                    .industry.aivat.io/
                  </p>
                </div>
              )}
            </div>
          </div>
          <div>
            <p className="text-xl font-semibold mb-2">Credenciales de API</p>
            <div className="flex flex-col gap-3 rounded-md bg-gray-200 dark:bg-gray-900 p-4">
              <div className="flex flex-col gap-1">
                <p className="text-lg">Nombre de usuario:</p>
                <TextInput
                  name="api_username"
                  control={control}
                  required={true}
                />
              </div>

              <div className="flex flex-col gap-1">
                <p className="text-lg">Contraseña:</p>
                <TextInput
                  name="api_password"
                  control={control}
                  required={true}
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-10">
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
        </div>
      </form>
    </section>
  );
};

export default AddSDClientPage;
