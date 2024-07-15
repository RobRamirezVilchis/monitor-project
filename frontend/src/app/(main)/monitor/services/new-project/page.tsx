"use client";

import { useNewProjectMutation } from "@/api/mutations/monitor";
import { NewProjectData } from "@/api/services/monitor/types";
import { MultiSelect, Select, TextInput } from "@/ui/core";
import { Alert, Button, Loader } from "@mantine/core";

import {
  useAllRDSQuery,
  useAllServersQuery,
  useDeploymentsQuery,
} from "@/api/queries/monitor";
import { useState } from "react";
import { useForm } from "react-hook-form";
import Breadcrumbs from "../../(components)/Breadcrumbs";

const AddProjectPage = () => {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors },
  } = useForm<NewProjectData>({
    defaultValues: {
      name: "",
      servers: [],
      database_id: 0,
      deployment: "",
    },
  });

  const deploymentsQuery = useDeploymentsQuery({});
  const serversQuery = useAllServersQuery({});
  const rdsQuery = useAllRDSQuery({});

  let deployments, servers, rds;
  if (deploymentsQuery.data) {
    deployments = deploymentsQuery.data.map((obj) => obj["name"]);
  }
  if (serversQuery.data) {
    servers = serversQuery.data.map((obj) => ({
      value: obj.aws_id,
      label: `${obj.name} (${obj.aws_id})`,
    }));
  }
  if (rdsQuery.data) {
    rds = rdsQuery.data.map((obj) => ({
      value: String(obj.id),
      label: obj.name,
    }));
  }

  const newProjectMutation = useNewProjectMutation({
    onSuccess: () => {
      setSuccess(true);
    },
    onError: (error: any, variables, context) => {
      setError("Ocurrió un error");
    },
  });

  const onSubmit = async (values: NewProjectData) => {
    newProjectMutation.mutate(values);
    setSuccess(false);
    console.log(values);
  };
  const loading = newProjectMutation.isLoading;

  return (
    <section className="relative">
      <Breadcrumbs
        links={[{ href: "/monitor/services/", name: "Servicios" }]}
        pageName="Nuevo proyecto"
      ></Breadcrumbs>
      <p className="text-2xl mb-10 opacity-50 mt-4">
        Agrega un nuevo proyecto asociado a servidores, base de datos, y
        despliegue
      </p>

      <form
        className="flex flex-col justify-center items-center"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="flex flex-col gap-6 border border-gray-300 dark:border-dark-400 p-6 rounded-xl">
          <div className="gap-2 items-center">
            <p className="text-lg">Nombre del proyecto</p>
            <TextInput
              name="name"
              className="w-96"
              control={control}
              required={true}
            />
          </div>

          <div className="flex">
            {servers && (
              <div className=" gap-2 items-center">
                <p className="text-lg">Servidores asociados</p>
                <MultiSelect
                  name="servers"
                  className="w-96"
                  data={servers}
                  control={control}
                  searchable
                  clearable
                ></MultiSelect>
              </div>
            )}
          </div>

          <div className="flex gap-10 items-center">
            {rdsQuery.data && (
              <div className=" gap-2 items-center">
                <p className="text-lg">Base de datos</p>
                <Select
                  name="database_id"
                  data={rds}
                  className="w-96"
                  required={false}
                  control={control}
                  placeholder="Ninguna"
                ></Select>
              </div>
            )}
          </div>

          <div className="flex gap-10 items-center">
            {deploymentsQuery.data && (
              <div className=" gap-2 items-center">
                <p className="text-lg">Despliegue</p>
                <Select
                  name="deployment"
                  data={deployments}
                  className="w-96"
                  control={control}
                  required={true}
                ></Select>
              </div>
            )}
          </div>

          <div className="flex gap-10">
            <Button type="submit" size="lg" color="green">
              Agregar
            </Button>
            {!success && !newProjectMutation.isLoading && error && (
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
                ¡Proyecto agregado con éxito!
              </Alert>
            )}
          </div>
        </div>
      </form>
    </section>
  );
};

export default AddProjectPage;
