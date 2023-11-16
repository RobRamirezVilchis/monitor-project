import { ReactNode } from "react";
import { 
  ActionIcon, type ActionIconProps,
  Combobox, useCombobox, 
  type ComboboxDropdownProps, type ComboboxOptionProps,
  InputBase, type InputBaseProps,
  Switch,
  useMantineColorScheme,
  MantineColorScheme,
} from "@mantine/core";
import clsx from "clsx";

import switchToggleStyles from "./ColorSchemeSwitchToggle.module.css";

import { IconDeviceDesktop } from "@tabler/icons-react";
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import NightlightOutlinedIcon from '@mui/icons-material/NightlightOutlined';

export interface ColorSchemeToggleButtonProps extends Omit<ActionIconProps, "children"> {}

export const ColorSchemeButtonToggle = (props: ColorSchemeToggleButtonProps) => {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();

  return (
    <ActionIcon 
      color={colorScheme === "dark" ? "white" : "black"}
      {...props}
      onClick={toggleColorScheme}
    >
      {colorScheme === "dark" ? <NightlightOutlinedIcon /> : <LightModeOutlinedIcon />}
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
    light: <LightModeOutlinedIcon />,
    dark: <NightlightOutlinedIcon />,
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

export interface ColorSchemeSwitchToggleProps {
  size?: InputBaseProps["size"];
}

export const ColorSchemeSwitchToggle = ({
  size = "lg",
}: ColorSchemeSwitchToggleProps) => {
  const { colorScheme, setColorScheme } = useMantineColorScheme();

  return (
    <Switch
      checked={colorScheme === "dark"}
      onChange={e => {
        const dark = e.currentTarget.checked;
        setColorScheme(dark ? "dark" : "light");
      }}
      offLabel={<LightModeOutlinedIcon className="text-white" />}
      onLabel={<NightlightOutlinedIcon className="text-white" />}
      size={size}
      classNames={{
        thumb: clsx({
          [switchToggleStyles["thumb-light"]]: colorScheme === "light",
          [switchToggleStyles["thumb-dark"]]: colorScheme === "dark",
        }),
        track: clsx({
          [switchToggleStyles["track-light"]]: colorScheme === "light",
          [switchToggleStyles["track-dark"]]: colorScheme === "dark",
        }),
      }}
    />
  )
}