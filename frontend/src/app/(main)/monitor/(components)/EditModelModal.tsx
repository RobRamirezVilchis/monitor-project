import { UseCreatedQueryResult } from "@/api/helpers/createQuery";
import {
  useCreateGxModelMutation,
  useUpdateGxModelMutation as useChangeGxModelMutation,
  useEditModelMutation,
} from "@/api/mutations/monitor";
import { useGxModelQuery, useGxModelsQuery } from "@/api/queries/monitor";
import { GxFilter, GxModel } from "@/api/services/monitor/types";
import { Select, TextInput } from "@/ui/core";
import {
  showErrorNotification,
  showSuccessNotification,
} from "@/ui/notifications";
import { UnionFlatten } from "@/utils/types";
import { Button, Modal } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

const EditModelModal = (props: {
  modalProps: { opened: boolean; close: () => void };
  modelQuery: UseCreatedQueryResult<
    GxFilter,
    GxModel,
    GxModel,
    unknown,
    UnionFlatten<string, GxFilter[]>
  >;
  gxId: number;
  gxModels: { id: number; name: string }[] | undefined;
  onModelChange?: () => void;
}) => {
  const [
    editModelModalOpened,
    { open: editModelModalOpen, close: editModelModalClose },
  ] = useDisclosure(false);

  const {
    handleSubmit: handleSubmitModels,
    watch: watchModels,
    control: controlModels,
    reset: resetModels,
  } = useForm<{ name: string }>();

  useEffect(() => {
    resetModels({ name: props.modelQuery.data?.name });
  }, [props.modelQuery.data]);

  const {
    handleSubmit: handleSubmitNewModel,
    watch: watchNewModel,
    control: controlNewModel,
    reset: resetNewModel,
  } = useForm<{ name: string }>();
  const {
    handleSubmit: handleSubmitEditModel,
    watch: watchEditModel,
    control: controlEditModel,
    reset: resetEditModel,
  } = useForm<{ id: number; name: string }>();

  const allGxModelsQuery = useGxModelsQuery({});
  const createModelMutation = useCreateGxModelMutation({
    onSuccess: () => {
      showSuccessNotification({ message: "Modelo creado con éxito" });
      allGxModelsQuery.refetch();
      resetNewModel({ name: "" });
    },
    onError: () => {
      showErrorNotification({ message: "Ocurrió un error." });
    },
  });
  const editModelMutation = useEditModelMutation({
    onSuccess: () => {
      props.modelQuery.refetch();
      if (props.onModelChange) {
        props.onModelChange();
      }
      editModelModalClose();
    },
    onError: () => {
      showErrorNotification({ message: "Ocurrió un error." });
    },
  });
  const changeModelMutation = useChangeGxModelMutation({
    onSuccess: () => {
      showSuccessNotification({ message: "Modelo actualizado con éxito" });
      props.modelQuery.refetch();
      if (props.onModelChange) {
        props.onModelChange();
      }
    },
  });

  const submitModelCreate = async (values: { name: string }) => {
    createModelMutation.mutate({ name: values.name });
  };
  const submitModelEdit = async (values: { id: number; name: string }) => {
    editModelMutation.mutate({
      id: values.id,
      name: values.name,
    });
  };
  const submitModelChange = async (values: { name: string }) => {
    changeModelMutation.mutate({
      gx_id: Number(props.gxId),
      name: values.name,
    });
  };

  return (
    <>
      <Modal
        opened={props.modalProps.opened}
        onClose={props.modalProps.close}
        title="Cambiar modelo de GX"
        classNames={{ title: "text-xl font-semibold" }}
      >
        <p className="text-neutral-600 dark:text-neutral-400 mb-3">
          El modelo de la GX determina qué criterios se utilizan para marcar
          alguna métrica como crítica.
        </p>
        {props.gxModels && (
          <>
            <form onSubmit={handleSubmitModels(submitModelChange)}>
              <div className="flex justify-between ">
                <div className="flex gap-1">
                  <Select
                    name="name"
                    control={controlModels}
                    classNames={{ root: "flex-1 grow w-64" }}
                    data={props.gxModels.map((m) => m.name)}
                  ></Select>

                  <button
                    type="button"
                    onClick={() => {
                      resetEditModel();
                      editModelModalOpen();
                    }}
                    className="py-1 px-2 border-neutral-300 hover:bg-neutral-100 transition-colors rounded-md"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20  "
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-neutral-400 transition-colors icon icon-tabler icons-tabler-outline icon-tabler-edit"
                    >
                      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                      <path d="M7 7h-1a2 2 0 0 0 -2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2 -2v-1" />
                      <path d="M20.385 6.585a2.1 2.1 0 0 0 -2.97 -2.97l-8.415 8.385v3h3l8.385 -8.415z" />
                      <path d="M16 5l3 3" />
                    </svg>
                  </button>
                </div>
                <Button className=" w-24" type="submit" color="green.7">
                  Aceptar
                </Button>
              </div>
            </form>
            <div className="py-3 flex justify-center items-center gap-2 text-neutral-500">
              <div className=" w-14 h-0 border-b-2 border-neutral-300 dark:border-neutral-500" />
              <p>O crea un modelo nuevo</p>
              <div className=" w-14 h-0 border-b-2 border-neutral-300 dark:border-neutral-500" />
            </div>
            <form onSubmit={handleSubmitNewModel(submitModelCreate)}>
              <div className="flex gap-3 justify-between">
                <TextInput
                  name="name"
                  control={controlNewModel}
                  classNames={{ root: "w-full" }}
                ></TextInput>

                <Button
                  disabled={
                    watchNewModel("name") == null || watchNewModel("name") == ""
                  }
                  variant="outline"
                  className="w-36"
                  type="submit"
                >
                  Crear
                </Button>
              </div>
            </form>
          </>
        )}
      </Modal>
      <Modal
        opened={editModelModalOpened}
        onClose={editModelModalClose}
        title="Editar modelo"
        size={"sm"}
        classNames={{ title: "text-xl font-semibold" }}
      >
        <p className="text-neutral-600 dark:text-neutral-400 mb-3">
          Edita el nombre de un modelo de GX.
        </p>
        {props.gxModels && (
          <>
            <form onSubmit={handleSubmitEditModel(submitModelEdit)}>
              <div className="flex flex-col gap-3 items-end justify-between">
                <Select
                  name="id"
                  required
                  placeholder="Selecciona el modelo a editar"
                  control={controlEditModel}
                  classNames={{ root: "w-full" }}
                  data={props.gxModels.map((m) => ({
                    value: m.id.toString(),
                    label: m.name,
                  }))}
                ></Select>

                <TextInput
                  name="name"
                  required
                  placeholder="Escribe el nuevo nombre"
                  control={controlEditModel}
                  classNames={{ root: "w-full" }}
                ></TextInput>

                <Button className="w-28" type="submit">
                  Editar
                </Button>
              </div>
            </form>
          </>
        )}
      </Modal>
    </>
  );
};

export default EditModelModal;
