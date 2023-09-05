import { FC } from "react";
import { FormProvider, useForm } from "react-hook-form";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Button  from "@mui/lab/LoadingButton";

import { TextInput, Select } from "../shared/hook-form/styled";
import { CreateWhitelistItemData } from "@/api/users.types";
import { getUserRoleLocalized } from "@/api/users";
import { userRoles } from "@/api/auth.types";

export interface NewUserFormProps {
  onSubmit: (data: CreateWhitelistItemData) => void;
  loading?: boolean;
}

const schema = z.object({
  email: z.string().email({ message: "Ingrese un email válido" }),
  group: z.string().nonempty({ message: "El grupo es requerido" }),
});

export const NewUserForm: FC<NewUserFormProps> = ({ onSubmit, loading }) => {
  const formMethods = useForm<CreateWhitelistItemData>({
    defaultValues: {
      email: "",
      group: "",
    },
    resolver: zodResolver(schema),
  });

  return (
    <section>
      <p className="text-xl font-bold text-blue-500 mb-4">
        Agregar usuario
      </p>

      <FormProvider {...formMethods}>
        <form 
          noValidate
          onSubmit={formMethods.handleSubmit(onSubmit)} 
        >
          <div className="flex flex-col gap-4">
            <TextInput
              name="email"
              variant="filled"
              type="email"
              placeholder="Correo"
              title="Correo"
              classes={{
                title: {
                  label: "text-neutral-700",
                },
              }}
              inputProps={{
                maxLength: 100,
              }}
              fullWidth
            />
            <Select
              name="group"
              variant="filled"
              title="Rol"
              options={userRoles.map(role => ({ value: role, label: getUserRoleLocalized(role) }))}
              placeholder="Rol"
              disablePlaceholder
              classes={{
                title: {
                  label: "text-neutral-700",
                },
              }}
              fullWidth
            />
            <div className="grid place-items-center">
              <Button
                variant="outlined"
                color="primary"
                type="submit"
                loading={loading}
              >
                Registrar
              </Button>
            </div>
          </div>
        </form>
      </FormProvider>
    </section>
  );
};
