import { 
  ActionIcon, type ActionIconProps,
  Combobox, useCombobox, 
  type ComboboxDropdownProps, type ComboboxOptionProps,
  InputBase, type InputBaseProps,
  Switch,
  useMantineColorScheme,
  useMantineTheme,
  MantineColorScheme,
} from "@mantine/core";
import clsx from "clsx";

import { IconSun, IconMoon, IconDeviceDesktop } from "@tabler/icons-react";
import { ReactNode, useEffect, useRef, useState } from "react";

export interface ColorSchemeToggleButtonProps extends Omit<ActionIconProps, "children"> {}

export const ColorSchemeButtonToggle = (props: ColorSchemeToggleButtonProps) => {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();

  return (
    <ActionIcon 
      color={colorScheme === "dark" ? "white" : "black"}
      {...props}
      onClick={toggleColorScheme}
    >
      {colorScheme === "dark" ? <IconMoon /> : <IconSun />}
    </ActionIcon>
  )
}

export interface ColorSchemaSelectToggleProps {
  classNames?: {
    input?: InputBaseProps["classNames"];
    dropdown?: ComboboxDropdownProps["classNames"];
    option?: ComboboxOptionProps["classNames"];
    label?: {
      root?: string;
      icon?: string;
      label?: string;
    }
  };
}

export const ColorSchemaSelectToggle = ({
  classNames,
}: ColorSchemaSelectToggleProps) => {
  const { colorScheme, setColorScheme } = useMantineColorScheme();
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
  });

  const data: MantineColorScheme[] = [
    "auto",
    "light",
    "dark",
  ];
  const icons: Record<MantineColorScheme, ReactNode> = {
    auto: <IconDeviceDesktop />,
    light: <IconSun />,
    dark: <IconMoon />,
  };
  const labels: Record<MantineColorScheme, string> = {
    auto: "Auto",
    light: "Light",
    dark: "Dark",
  };

  return (
    <Combobox
      store={combobox}
      onOptionSubmit={v => {
        setColorScheme(v as MantineColorScheme);
        combobox.closeDropdown();
      }}
    >
      <Combobox.Target>
        <InputBase
          component="button"
          pointer
          rightSection={<Combobox.Chevron />}
          rightSectionPointerEvents="none"
          onClick={() => combobox.toggleDropdown()}
          classNames={classNames?.input}
        >
          <span className={clsx("flex items-center gap-4", classNames?.label?.root)}>
            <span className={classNames?.label?.icon}>{icons[colorScheme]}</span>
            <span className={classNames?.label?.label}>{labels[colorScheme]}</span>
          </span>
        </InputBase>
      </Combobox.Target>
      
      <Combobox.Dropdown classNames={classNames?.dropdown}>
        {data.map((value, index) => (
          <Combobox.Option
            key={value}
            value={value}
            selected={colorScheme === value}
            className={clsx("flex items-center gap-4", classNames?.option)}
          >
            {icons[value]}
            {labels[value]}
          </Combobox.Option>
        ))}
      </Combobox.Dropdown>
    </Combobox>
  )
}

// TODO: Update Colors
export const ColorSchemeSwitchToggle = () => {
  const { colorScheme, setColorScheme } = useMantineColorScheme();
  const theme = useMantineTheme();

  return (
    <Switch
      checked={colorScheme === "dark"}
      onChange={e => {
        const dark = e.currentTarget.checked;
        setColorScheme(dark ? "dark" : "light");
      }}
      offLabel={<IconSun color={theme.colors.yellow[4]} stroke={2.5} />}
      onLabel={<IconMoon color={theme.colors.blue[6]} stroke={2.5} />}
      size="lg"
      classNames={{
        thumb: clsx({
          "bg-neutral-500": colorScheme === "light",
          "bg-neutral-200": colorScheme === "dark",
        }),
        track: clsx({
          "bg-neutral-400": colorScheme === "light",
          "bg-gray-800": colorScheme === "dark",
        }),
      }}
    />
  )
}