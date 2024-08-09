import { useModifyThresholdsMutation } from "@/api/mutations/monitor";
import { GxMetricThreshold } from "@/api/services/monitor/types";
import { Checkbox, NumberInput } from "@/ui/core";
import { showSuccessNotification } from "@/ui/notifications";
import { Button, Modal } from "@mantine/core";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

const EditGxThresholds = (props: {
  modalProps: { opened: boolean; close: () => void };
  gx_id: number;
  thresholds: GxMetricThreshold[] | undefined;
}) => {
  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors },
    reset,
  } = useForm<{ [key: string]: any }>();

  useEffect(() => {
    if (props.thresholds && props.modalProps.opened) {
      const currentValues: { [key: string]: any } = {};
      props.thresholds.map((th) => {
        currentValues[`${th.metric_name}_value`] = th.threshold;
        currentValues[`${th.metric_name}_toExceed`] = th.to_exceed;
        currentValues[`${th.metric_name}_enabled`] = th.threshold !== null;
      });
      reset(currentValues);
    }
  }, [props.modalProps.opened]);

  const thresholdsMutation = useModifyThresholdsMutation({
    onSuccess: () => {
      showSuccessNotification({
        message: "Se guardaron los nuevos valores con éxito",
      });
    },
    onError: () => {},
  });

  const submitNewThresholds = async (values: { [key: string]: any }) => {
    let data: any = {};
    data.gx_id = props.gx_id;
    data.thresholds = [];

    if (props.thresholds) {
      props.thresholds.forEach((th) => {
        data.thresholds.push({
          metric_name: th.metric_name,
          to_exceed: values[`${th.metric_name}_toExceed`],
          ...(values[`${th.metric_name}_enabled`]
            ? {
                value: values[`${th.metric_name}_value`],
              }
            : {
                value: null,
              }),
        });
      });
      thresholdsMutation.mutate(data);
    }
  };

  return (
    <>
      <Modal
        opened={props.modalProps.opened}
        onClose={props.modalProps.close}
        title="Modificar criterios"
        classNames={{ title: "text-xl font-semibold" }}
      >
        <form onSubmit={handleSubmit(submitNewThresholds)}>
          <p className="opacity-80 mb-3">
            Aquí puedes modificar los criterios para considerar una métrica como
            crítica.
          </p>
          <div className="flex gap-3 pr-3 items-end justify-end w-full">
            <p>Al exceder</p>
            <p>Habilitado</p>
          </div>
          <div className="flex justify-center">
            <div className="flex flex-col gap-3 items-center  mb-3">
              {props.thresholds && (
                <div className="flex flex-col gap-3 items-end">
                  {props.thresholds.map((th, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <p>{th.metric_name}</p>
                      <NumberInput
                        name={`${th.metric_name}_value`}
                        control={control}
                        classNames={{ root: "w-20 mr-10" }}
                        placeholder=""
                        value={th.threshold}
                        disabled={!watch(`${th.metric_name}_enabled`)}
                      ></NumberInput>
                      <Checkbox
                        name={`${th.metric_name}_toExceed`}
                        control={control}
                        disabled={!watch(`${th.metric_name}_enabled`)}
                        classNames={{ root: "mr-12" }}
                      ></Checkbox>
                      <Checkbox
                        name={`${th.metric_name}_enabled`}
                        control={control}
                        color="green.6"
                      ></Checkbox>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit">Aceptar</Button>
          </div>
        </form>
      </Modal>
    </>
  );
};

export default EditGxThresholds;
