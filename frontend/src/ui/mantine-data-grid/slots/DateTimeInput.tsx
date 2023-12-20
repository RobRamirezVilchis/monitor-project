import { ActionIcon } from "@mantine/core";
import { forwardRef, useRef } from "react";

import { DataGridSlotBaseProps } from "@/ui/data-grid/types";
import { DateTimePicker, DateTimePickerProps } from "@mantine/dates";

import { IconClock } from "@tabler/icons-react";

export type DateTimeInputProps = DateTimePickerProps & DataGridSlotBaseProps<any>["baseDateTimeInput"];

export const DateTimeInput = forwardRef<HTMLButtonElement, DateTimeInputProps>((props, ref) => {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <DateTimePicker
      timeInputProps={{
        ref: inputRef,
        rightSection: (
          <ActionIcon variant="subtle" color="gray" onClick={() => inputRef.current?.showPicker()}>
            <IconClock />
          </ActionIcon>
        )
      }}
      {...props as any}
      ref={ref}
    />
  );
});
DateTimeInput.displayName = "DateTimeInput";
