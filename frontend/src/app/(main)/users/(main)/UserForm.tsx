import { FormProvider, useForm } from "react-hook-form";
import { Button, Loader } from "@mantine/core";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";

import { Checkbox, MultiSelect, TextInput } from "@/ui/core";
import { getUserRoleLocalized } from "@/api/services/users";
import { Role } from "@/api/services/auth/types";
import { useRolesQuery } from "@/api/queries/users";
import { Id } from "@/api/types";

export interface UserFormProps {
  onSubmit: (data: UserFormValues) => void;
  onCancel?: () => void;
  loading?: boolean;
  defaultValues?:UserFormValues;
  disabled?: {
    email?: boolean;
    first_name?: boolean;
    last_name?: boolean;    
    roles?: boolean;
  };
  submitLabel?: string;
  cancelLabel?: string;
  showSendMailField?: boolean;
}

const schema = z.object({
  // username: z.string().max(150),
  email: z.string().email("Ingrese un email válido"),
  first_name: z.string().max(150),
  last_name: z.string().max(150),
  roles: z.array(z.custom<Role>()),
  send_email: z.boolean().optional(),
});

type UserFormValues = z.infer<typeof schema>;

export const UserForm = ({
  onSubmit,
  onCancel,
  loading, 
  defaultValues,
  disabled, 
  submitLabel,
  cancelLabel,
  showSendMailField,
}: UserFormProps) => {
  const form = useForm<UserFormValues>({
    defaultValues: {
      // username: defaultValues?.username ?? "",
      email: defaultValues?.email ?? "",
      first_name: defaultValues?.first_name ?? "",
      last_name: defaultValues?.last_name ?? "",
      roles: defaultValues?.roles ??  [],
      send_email: defaultValues?.send_email ?? (showSendMailField ? true : undefined),
    },
    resolver: zodResolver(schema),
  });

  const rolesQuery = useRolesQuery({
    refetchOnWindowFocus: false,
  });

  return (
    <FormProvider {...form}>
      <form 
        noValidate
        onSubmit={form.handleSubmit(onSubmit)} 
      >
        <div className="flex flex-col gap-4">
        {/* <TextInput
            name="username"
            control={formMethods.control}
            variant="filled"
            placeholder="Nombre de usuario"
            label="Nombre de usuario"
            maxLength={100}
          /> */}
          <TextInput
            data-autofocus
            name="email"
            control={form.control}
            variant="filled"
            type="email"
            placeholder="Correo"
            label="Correo"
            maxLength={100}
            withAsterisk
            disabled={disabled?.email}
          />
          <TextInput
            name="first_name"
            control={form.control}
            variant="filled"
            placeholder="Nombre"
            label="Nombre"
            maxLength={150}
            disabled={disabled?.first_name}
          />
          <TextInput
            name="last_name"
            control={form.control}
            variant="filled"
            placeholder="Apellido"
            label="Apellido"
            maxLength={100}
            disabled={disabled?.last_name}
          />
          <MultiSelect
            name="roles"
            control={form.control}
            variant="filled"
            label="Roles"
            data={rolesQuery.data?.map(role => ({ value: role, label: getUserRoleLocalized(role) })) ?? []}
            placeholder="Roles"
            disabled={disabled?.roles || rolesQuery.isLoading}
            searchable
            hidePickedOptions
            clearable
            rightSection={(rolesQuery.isLoading || rolesQuery.isFetching) ? <Loader size="xs" /> : null}
          />
          {showSendMailField ? (
            <Checkbox
              name="send_email"
              control={form.control}
              label="Enviar correo de activación"
              disabled={loading}
            />
          ) : null}
          <div className="flex justify-center items-center gap-8">
            <Button
              variant="outline"
              type="button"
              color="red"
              onClick={onCancel}
            >
              {cancelLabel || "Cancel"}
            </Button>
            <Button
              variant="outline"
              type="submit"
              loading={loading}
            >
              {submitLabel || "Submit"}
            </Button>
          </div>
        </div>
      </form>
    </FormProvider>
  );
};
