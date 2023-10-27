import { 
  type PasswordInputProps as _PasswordInputProps,
  Progress,
  Popover,
} from "@mantine/core";
import { FieldValues } from "react-hook-form";
import { useDisclosure } from "@mantine/hooks";
import clsx from "clsx";

import type { BaseInputProps } from "../types";
import _PasswordInput from "./PasswordInput";

import { IconX, IconCheck } from "@tabler/icons-react";
import { useMemo, useState } from "react";

export interface PasswordRequirement {
  pattern: RegExp;
  label: string;
}

export type MeteredPasswordInputProps<
  TFieldValues extends FieldValues = FieldValues,
> = BaseInputProps<TFieldValues, _PasswordInputProps> & {
  requirements: PasswordRequirement[];
};

const MeteredPasswordInput = <
  TFieldValues extends FieldValues = FieldValues,
>({
  requirements,
  ...props
}: MeteredPasswordInputProps<TFieldValues>) => {
  const [isOpen, { open, close }] = useDisclosure();

  const [value, setValue] = useState((props.value as string) ?? "");
  const checks = useMemo(
    () => requirements.map((requirement) => requirement.pattern.test(value)), 
    [value, requirements]
  );
  const strength = useMemo(
    () => Math.round(checks.filter((c) => c).length / checks.length * 100),
    [checks]
  );
  const color = strength === 100 
    ? "bg-green-500" 
    : strength > 50 
      ? "bg-yellow-500" 
      : "bg-red-500";

  return (
    <Popover opened={isOpen} width="target">
      <Popover.Target>
        <div
          onFocusCapture={open}
          onBlurCapture={close}
        >
          <_PasswordInput 
            {...props}
            onChange={e => {
              setValue(e.currentTarget.value);
              props.onChange?.(e);
            }}
          />
        </div>
      </Popover.Target>

      <Popover.Dropdown>
        <Progress 
          value={strength} 
          classNames={{
            root: "mb-2",
            section: color,
          }}
          size="xs"
        />
        {checks.map((c, idx) => (
          <div key={idx}
            className={clsx(
              "flex items-center gap-2 text-red-500", {
              "text-green-500": c,
              "text-red-500": !c,
            })}
          >
            {c ? <IconCheck className="w-4 h-4"/> : <IconX className="w-4 h-4" />}
            <span className="text-sm">{requirements[idx].label}</span>
          </div>
        ))}
      </Popover.Dropdown>
    </Popover>
  );
}

export default MeteredPasswordInput;
