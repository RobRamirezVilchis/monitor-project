"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";

import { Button } from "@mantine/core";
import { filterFromObject } from "@/utils/object.utils";
import { showSuccessNotification, showErrorNotification } from "@/ui/notifications";
import { TextInput, MeteredPasswordInput, PasswordInput } from "@/ui/core";
import { useAuth } from "@/hooks/auth";
import { useUpdateMyUserMutation } from "@/api/mutations/auth";
import { UpdateUserData } from "@/api/services/auth/types";
import { useConfirmDialog } from "@/hooks/shared";

const schema = z.object({
  first_name: z.string().max(150),
  last_name: z.string().max(150),
  password1: z.string().regex(
    /^$|^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/, 
    " "
  ),
  password2: z.string(),
}).refine(({password1, password2}) => password1 === password2, {
  message: "Las contraseñas no coinciden",
  path: ["password2"],
});

type Form = z.infer<typeof schema>;

const ProfilePage = () => {
  const { user } = useAuth();
  const updateMyUserMutation = useUpdateMyUserMutation({
    onSuccess: () => {
      showSuccessNotification({ message: "Información actualizada correctamente." });
      setValue("password1", "", { shouldDirty: false });
      setValue("password2", "", { shouldDirty: false });
    },
    onError: () => showErrorNotification({
      message: "Error al actualizar la información de usuario, Por favor intente de nuevo.",
    }),
  });
  const { confirm } = useConfirmDialog({

  });

  const form = useForm<Form>({
    resolver: zodResolver(schema),
    mode: "onTouched",
    defaultValues: { 
      first_name: user?.first_name ?? "",
      last_name: user?.last_name ?? "",
      password1: "",
      password2: "",
    }
  });
  const { getFieldState, trigger, formState: { dirtyFields, isDirty, isValid }, setValue } = form;

  const onSubmit = ({ password1, password2, ...data }: Form) => {
    const passwords = {
      ...(password1 && { password1 }),
      ...(password2 && { password2 }),
    };
    const payload: UpdateUserData = filterFromObject({ 
      ...data,
      ...passwords,
    }, dirtyFields);
    if (payload.password1 && payload.password2) {
      confirm({
        title: "Cambio de contraseña",
        content: "¿Se cambiara tu contraseña, estás seguro de continuar?",
        onConfirm: () => updateMyUserMutation.mutate(payload),
      });
    } else {
      updateMyUserMutation.mutate(payload);
    }
  };

  return (
    <section className="flex flex-col h-full lg:container mx-auto pb-2 md:pb-6">
      <div className="flex items-center">
        <h1 className="text-3xl font-bold py-2 flex-1">
          Mi usuario
        </h1>
      </div>

      <form
        noValidate
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-4 max-w-md"
      >
          <TextInput
            name="first_name"
            control={form.control}
            placeholder="Nombre"
            label="Nombre"
            maxLength={150}
          />
          <TextInput
            name="last_name"
            control={form.control}
            placeholder="Apellido"
            label="Apellido"
            maxLength={100}
          />
          <TextInput
            value={user?.email ?? ""}
            type="email"
            placeholder="Correo"
            label="Correo"
            maxLength={100}
            disabled
          />

          <MeteredPasswordInput
            name="password1"
            control={form.control}
            placeholder="Contraseña"
            label="Contraseña"
            maxLength={150}
            onChange={() => {
              if (getFieldState("password2").isTouched) trigger("password2");
            }}
            requirements={[
              { pattern: /.{8,}/, label: "8 caracteres" },
              { pattern: /[A-Z]/, label: "1 mayúscula" },
              { pattern: /[a-z]/, label: "1 minúscula" },
              { pattern: /[0-9]/, label: "1 número" },
            ]}
          />
          <PasswordInput
            name="password2"
            control={form.control}
            placeholder="Repetir contraseña"
            label="Confirmar contraseña"
            maxLength={255}
          />

          <Button
            type="submit"
            className="mt-10"
            loading={updateMyUserMutation.isLoading}
            disabled={!isDirty || !isValid}
          >
            Guardar
          </Button>
      </form>
    </section>
  );
};

export default ProfilePage;
