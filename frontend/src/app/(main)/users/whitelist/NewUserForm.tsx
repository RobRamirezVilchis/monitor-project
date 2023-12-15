import { FC } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { Button } from "@mantine/core";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";

import { Select, TextInput } from "@/ui/core";
import { CreateWhitelistItemData } from "@/api/services/users/types";
import { getUserRoleLocalized } from "@/api/services/users";
import { userRoles } from "@/api/services/auth/types";

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
      <FormProvider {...formMethods}>
        <form 
          noValidate
          onSubmit={formMethods.handleSubmit(onSubmit)} 
        >
          <div className="flex flex-col gap-4">
            <TextInput
              name="email"
              control={formMethods.control}
              variant="filled"
              type="email"
              placeholder="Correo"
              label="Correo"
              maxLength={100}
            />
            <Select
              name="group"
              control={formMethods.control}
              variant="filled"
              label="Rol"
              data={userRoles.map(role => ({ value: role, label: getUserRoleLocalized(role) }))}
              placeholder="Rol"
            />
            <div className="grid place-items-center">
              <Button
                variant="outline"
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
