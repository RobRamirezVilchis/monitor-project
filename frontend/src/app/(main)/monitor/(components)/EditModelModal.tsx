import { UseCreatedQueryResult } from "@/api/helpers/createQuery";
import {
  useCreateGxModelMutation,
  useUpdateGxModelMutation,
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
  gxModels: { name: string }[] | undefined;
  onModelChange?: () => void;
}) => {
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

  const updateModelMutation = useUpdateGxModelMutation({
    onSuccess: () => {
      showSuccessNotification({ message: "Modelo actualizado con éxito" });
      props.modelQuery.refetch();
      if (props.onModelChange) {
        props.onModelChange();
      }
    },
  });
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
  const submitModelChange = async (values: { name: string }) => {
    updateModelMutation.mutate({
      gx_id: Number(props.gxId),
      name: values.name,
    });
  };
  const allGxModelsQuery = useGxModelsQuery({});

  const submitModelCreate = async (values: { name: string }) => {
    createModelMutation.mutate({ name: values.name });
  };

  return (
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
            <div className="flex gap-3 justify-between">
              <Select
                name="name"
                control={controlModels}
                classNames={{ root: "w-full" }}
                data={props.gxModels.map((m) => m.name)}
              ></Select>

              <Button className="w-36" type="submit">
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
  );
};

export default EditModelModal;
