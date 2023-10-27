import { ComponentPropsWithoutRef, MouseEvent, ReactNode, useCallback } from "react";
import { 
  ActionIcon, type ActionIconProps, 
  Menu, type MenuProps, 
  Paper, type PaperProps,
} from "@mantine/core";

import {
  getLast30DaysDatesRange, 
  getLast7DaysDatesRange, 
  getLastMonthDatesRange, 
  getLastQuarterDatesRange, 
  getLastWeekDatesRange, 
  getLastYearDatesRange, 
  getThisMonthDatesRange, 
  getThisQuarterDatesRange, 
  getThisWeekDatesRange, 
  getThisYearDatesRange, 
  getTodayDatesRange, 
  getYesterdayDatesRange,
} from "@/utils/date.utils";
  
import DateRangeIcon from "@mui/icons-material/DateRange";

export interface DateRangePresetBaseProps {
  onPresetClick?: (value: [Date, Date], event: MouseEvent<HTMLButtonElement, globalThis.MouseEvent>) => void;
}

export interface DateRangePresetsProps 
  extends MenuProps, 
  DateRangePresetBaseProps {
  actionIconProps?: ActionIconProps;
  icon?: ReactNode;
  iconProps?: ComponentPropsWithoutRef<typeof DateRangeIcon>;
}

const DateRangePresets = ({
  actionIconProps,
  icon,
  iconProps,
  onPresetClick,
  ...props
}: DateRangePresetsProps) => {

  return (
    <Menu {...props}>
      <Menu.Target>
        <ActionIcon {...actionIconProps}>
          {icon || <DateRangeIcon {...iconProps} />}
        </ActionIcon>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Label>Rangos predefinidos</Menu.Label>
        <DateRangePresetItems onPresetClick={onPresetClick} />
      </Menu.Dropdown>
    </Menu>
  )
}

export default DateRangePresets;

export interface DateRangePresetsListProps 
  extends MenuProps, 
  DateRangePresetBaseProps {
  paperProps?: PaperProps;
}

export const DateRangePresetsList = ({
  paperProps,
  onPresetClick,
  ...props
}: DateRangePresetsListProps) => {
  return (
    <Paper {...paperProps}>
      <Menu {...props}>
        <DateRangePresetItems onPresetClick={onPresetClick} />
      </Menu>
    </Paper>
  );
}

const DateRangePresetItems = ({
  onPresetClick,
}: DateRangePresetBaseProps) => {

  const getOnClickHandle = useCallback((preset: keyof typeof dateRangePresets) => {
    return (event: MouseEvent<HTMLButtonElement, globalThis.MouseEvent>) => {
      if (!dateRangePresets[preset])
        throw new Error(`Invalid date range preset: ${preset}`);
      onPresetClick?.(dateRangePresets[preset](), event);
    };
  }, [onPresetClick]);

  return (<>
    <Menu.Item onClick={getOnClickHandle("today")}>Hoy</Menu.Item>
    <Menu.Item onClick={getOnClickHandle("yesterday")}>Ayer</Menu.Item>
    <Menu.Item onClick={getOnClickHandle("last7Days")}>Últimos 7 días</Menu.Item>
    <Menu.Item onClick={getOnClickHandle("thisWeek")}>Esta semana</Menu.Item>
    <Menu.Item onClick={getOnClickHandle("lastWeek")}>Semana anterior</Menu.Item>
    <Menu.Item onClick={getOnClickHandle("last30Days")}>Últimos 30 días</Menu.Item>
    <Menu.Item onClick={getOnClickHandle("thisMonth")}>Este mes</Menu.Item>
    <Menu.Item onClick={getOnClickHandle("lastMonth")}>Mes anterior</Menu.Item>
    <Menu.Item onClick={getOnClickHandle("thisQuarter")}>Este trimestre</Menu.Item>
    <Menu.Item onClick={getOnClickHandle("lastQuarter")}>Trimestre anterior</Menu.Item>
    <Menu.Item onClick={getOnClickHandle("thisYear")}>Este año</Menu.Item>
    <Menu.Item onClick={getOnClickHandle("lastYear")}>Año anterior</Menu.Item>
  </>);
}

const dateRangePresets = {
  today: getTodayDatesRange,
  yesterday: getYesterdayDatesRange,
  last7Days: getLast7DaysDatesRange,
  thisWeek: getThisWeekDatesRange,
  lastWeek: getLastWeekDatesRange,
  last30Days: getLast30DaysDatesRange,
  thisMonth: getThisMonthDatesRange,
  lastMonth: getLastMonthDatesRange,
  thisQuarter: getThisQuarterDatesRange,
  lastQuarter: getLastQuarterDatesRange,
  thisYear: getThisYearDatesRange,
  lastYear: getLastYearDatesRange,
};
