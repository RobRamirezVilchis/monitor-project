"use client";

import { ReactNode, useEffect, useState } from "react";
import "@mantine/charts/styles.css";
import { Alert, Button, Modal, Tabs } from "@mantine/core";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useDisclosure } from "@mantine/hooks";
import {
  useAllRDSQuery,
  useAllServersQuery,
  useDeploymentsQuery,
  useProjectDataQuery,
  useProjectsQuery,
  useServersProjectsQuery,
} from "@/api/queries/monitor";
import { useForm } from "react-hook-form";
import {
  EditedProjectData,
  NewProjectData,
  ProjectData,
} from "@/api/services/monitor/types";
import { MultiSelect, Select, TextInput } from "@/ui/core";
import {
  useDeleteProjectMutation,
  useEditProjectMutation,
  useProjectDataMutation,
} from "@/api/mutations/monitor";
import { setErrorMap } from "zod";

type EditedProject = {
  name: string;
  servers: string[];
  database_id: string | null;
  deployment: string;
};

const ServicesDashboardLayout = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const pathname = usePathname();
  const currentTab = pathname.split("/").slice(-2, -1)[0];
  const [projectId, setProjectId] = useState<number | null>(null);

  const [modalOpened, { open, close }] = useDisclosure();
  const [confirmOpened, { open: confirmOpen, close: confirmClose }] =
    useDisclosure();
  const serversQuery = useAllServersQuery({});
  const rdsQuery = useAllRDSQuery({});
  const deploymentsQuery = useDeploymentsQuery({});
  const [success, setSuccess] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const {
    register,
    handleSubmit,
    watch,
    control,
    reset,
    formState: { errors },
  } = useForm<EditedProject>({
    defaultValues: {
      name: "",
      servers: [],
      database_id: null,
      deployment: "",
    },
  });

  let deployments, servers, rds;
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

  const projectsQuery = useProjectsQuery({});
  const projects = projectsQuery.data;

  const projectDataMutation = useProjectDataMutation({
    onSuccess: (values) => {
      setError("");
      reset({
        name: values.name,
        servers: values.servers.map((serv) => serv.aws_id),
        ...(values.database_id && {
          database_id: values.database_id.toString(),
        }),
        ...(values.deployment && {
          deployment: values.deployment,
        }),
      });
    },
    onError: (error: any, variables, context) => {},
  });

  const editProjectMutation = useEditProjectMutation({
    onSuccess: (values) => {
      setSuccess(true);
    },
    onError: (error: any, variables, context) => {
      setError("Ocurrió un error");
    },
  });

  const deleteProjectMutation = useDeleteProjectMutation({});

  const onSubmit = async (values: Omit<EditedProjectData, "id">) => {
    if (projectId) {
      editProjectMutation.mutate({ ...values, id: projectId });
    }
  };

  return (
    <section>
      <Modal
        className="flex flex-col gap-4"
        opened={modalOpened}
        onClose={() => {
          close();
          reset({
            name: "",
            servers: [],
            database_id: null,
            deployment: "",
          });
          setProjectId(null);
        }}
        title="Modificar proyecto"
      >
        <div className="flex flex-col gap-4">
          {projects && (
            <Select
              value={projectId ? projectId.toString() : null}
              onChange={(x) => {
                if (x) {
                  setProjectId(Number(x));
                  projectDataMutation.mutate(Number(x));
                } else {
                  setProjectId(null);
                }
              }}
              data={projects?.map((x) => {
                return { value: x.id.toString(), label: x.name };
              })}
              label="Elige el proyecto a modificar"
              searchable
            ></Select>
          )}
          {projectDataMutation.isSuccess && projectId !== null && (
            <form
              className="flex flex-col gap-4 bg-neutral-100 dark:bg-dark-500 p-2 rounded-md"
              onSubmit={handleSubmit(onSubmit)}
            >
              <TextInput name="name" control={control} label="Nombre" />
              <MultiSelect
                name="servers"
                control={control}
                label="Servidores asociados"
                data={servers}
                searchable
              />
              <Select
                label="Base de datos"
                name="database_id"
                control={control}
                data={rds}
              />
              <Select
                label="Despliegue"
                name="deployment"
                required={true}
                control={control}
                data={deploymentsQuery.data?.map((dep) => dep.name)}
              />
              <div className="flex gap-2 justify-end mb-3">
                {!success && !editProjectMutation.isLoading && error && (
                  <Alert
                    color="red"
                    classNames={{
                      message: "text-red-700 text-sm",
                      root: "h-10 flex flex-col justify-center",
                    }}
                    onClose={() => setError("")}
                    withCloseButton
                  >
                    {error}
                  </Alert>
                )}
                {success && (
                  <Alert
                    color="green"
                    classNames={{
                      message: "text-green-700",
                      root: "h-12 w-48 flex flex-col justify-center",
                    }}
                    onClose={() => setSuccess(false)}
                    withCloseButton
                  >
                    ¡Proyecto modificado con éxito!
                  </Alert>
                )}
                <Button color="gray.6" onClick={confirmOpen}>
                  Eliminar
                </Button>
                <Button color="green.7" type="submit">
                  Aceptar
                </Button>
              </div>
            </form>
          )}
        </div>
      </Modal>
      <Modal
        opened={confirmOpened}
        onClose={confirmClose}
        withCloseButton={false}
      >
        <div className="flex flex-col gap-2">
          <h1 className="text-lg font-semibold mb-3">
            ¿Deseas eliminar el proyecto?
          </h1>
          <p className="text-md">Esta acción no puede ser revertida.</p>
          <div className="flex justify-end gap-2">
            <Button color="gray.6" onClick={confirmClose}>
              Cancelar
            </Button>
            <Button
              color="red"
              onClick={() => {
                if (projectId) {
                  deleteProjectMutation.mutate({ id: projectId });
                }
                confirmClose();
                close();
                projectsQuery.refetch();
                setProjectId(null);
              }}
            >
              Continuar
            </Button>
          </div>
        </div>
      </Modal>
      <Tabs color="gray.6" value={currentTab}>
        <div className="md:flex md:items-center pb-2 mb-3 md:mb-6 justify-left xl:justify-between">
          <div className="md:flex md:items-center mr-3 xl:mr-0 mb-2 sm:mb-0">
            <h1 className="mb-4  md:mb-0 text-5xl font-bold pr-10 ">
              Servicios
            </h1>
            <Tabs.List color="green">
              <Link href="/monitor/services/servers/details">
                <Tabs.Tab className="text-lg" value="servers">
                  Servidores
                </Tabs.Tab>
              </Link>
              <Link href="/monitor/services/rds/details">
                <Tabs.Tab className="text-lg" value="rds">
                  Bases de datos
                </Tabs.Tab>
              </Link>
              <Link href="/monitor/services/load-balancers/details">
                <Tabs.Tab className="text-lg" value="load-balancers">
                  Distribuidores de carga
                </Tabs.Tab>
              </Link>
            </Tabs.List>
          </div>
          <div className="flex gap-3 sm:max-xl:flex-col">
            <Button onClick={open} className="w-fit" color="gray.6">
              Modificar proyecto
            </Button>
            <Link href={"/monitor/services/new-project"}>
              <Button color="green.7">Nuevo proyecto</Button>
            </Link>
          </div>
        </div>
        <div>{children}</div>
      </Tabs>
    </section>
  );
};

export default ServicesDashboardLayout;
