"use client";

//! Using custom styling
// import "react-datepicker/dist/react-datepicker.css";
import "@/styles/react-datepicker-custom.css";

/**
 * docs: https://github.com/Hacker0x01/react-datepicker/blob/master/docs/datepicker.md
 * examples: https://reactdatepicker.com/
 */

import React, { useState } from "react";
import RDatePicker, {
  CalendarContainer,
  registerLocale,
  ReactDatePickerProps,
  CalendarContainerProps,
} from "react-datepicker";
import es from "date-fns/locale/es";
import IconButton from "@mui/material/IconButton";
import ButtonBase from "@mui/material/ButtonBase";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";

import breakpoints from "@/utils/breakpoints";
import { useMediaQuery } from "@/hooks/shared";

import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

registerLocale("es", es);

export interface DatePickerProps<
  CustomModifierNames extends string = never,
  WithRange extends boolean | undefined = undefined
> extends ReactDatePickerProps<CustomModifierNames, WithRange> {
}

/**
 * TODO: Add support for the useForm hook if needed
 */
export const DatePicker = <
  WithRange extends boolean | undefined = undefined,
  CustomModifierNames extends string = never,
>({
  children,
  ...props
}: DatePickerProps<CustomModifierNames, WithRange>) => {

  const CustomCalendarContainer = React.useCallback(({
    className,
    children,
  } : CalendarContainerProps) => {
    /* eslint-disable react-hooks/rules-of-hooks */
    const [selectedTab, setSelectedTab] = useState(0);
    const desktop = useMediaQuery(`(min-width: ${breakpoints.md}px)`);
    /* eslint-enable react-hooks/rules-of-hooks */
    
    return (
      <div className="bg-white shadow-md rounded-2xl shadow-br p-2">
        <div className="flex flex-col items-center">
          <div className="hidden md:block px-4 pt-2 text-green-600 text-xs self-start">
            Seleccionar fecha{props.selectsRange ? " o periodo" : ""}
          </div>

          {!desktop && props.selectsRange ? (
            <Tabs
              value={selectedTab}
              onChange={(e, v) => setSelectedTab(v)}
              variant="fullWidth"
              classes={{
                root: "!p-1",
                indicator: "hidden",
              }}
            >
              <Tab
                label="Seleccionar fecha o periodo"
                value={0}
                classes={{
                  root: "!normal-case !text-base !font-normal text-neutral-500",
                  selected: "!text-green-600 !bg-green-50 !rounded-xl"
                }}
                wrapped
              />
              <Tab
                label="Accesos rápidos"
                value={1}
                classes={{
                  root: "!normal-case !text-base !font-normal text-neutral-500",
                  selected: "!text-green-600 !bg-green-50 !rounded-xl"
                }}
                wrapped
              />
            </Tabs>
          ) : null}

          <div className="flex gap-4 h-full">
            {desktop || selectedTab === 0 ? (
              <CalendarContainer className={className}>{children}</CalendarContainer>
            ) : null}

            {props.selectsRange ? (
              <>
                <div className="hidden md:flex items-center">
                  <div className="border-r border-r-1 border-green-500 h-3/4"></div>
                </div>

                {desktop || selectedTab === 1 ? (
                  <div className="flex flex-col pr-2 font-bold pb-2 justify-center">
                    <DatePresets onChange={props.onChange as any} />
                  </div>
                ) : null}
              </>
            ) : null}
          </div>
        </div>
      </div>
    );
  }, [props.selectsRange, props.onChange]);

  return (
    <RDatePicker<CustomModifierNames, WithRange> 
      locale="es" 
      calendarContainer={CustomCalendarContainer}
      renderCustomHeader={({
        date,
        changeYear,
        changeMonth,
        decreaseMonth,
        increaseMonth,
        prevMonthButtonDisabled,
        nextMonthButtonDisabled,
      }) => (
        <div className="text-green-600 flex items-center px-1">
          <div>
            <RDatePicker
              locale="es"
              selected={date}
              onChange={date => {
                if (date) {
                  changeYear(date.getFullYear());
                  changeMonth(date.getMonth());
                }
              }}
              showMonthYearPicker
              calendarContainer={SimpleCalendarContainer}
              dateFormat="MMMM yyyy"
              customInput={<MonthYearCustomInput />}
              showPopperArrow={false}
              renderCustomHeader={({ date, decreaseYear, increaseYear }) => (
                <div className="text-green-600 grid grid-cols-[auto_minmax(0,1fr)_auto] items-center px-1">
                  <IconButton color="inherit" 
                    disabled={prevMonthButtonDisabled}
                    onClick={() => decreaseYear()}
                  >
                    <NavigateBeforeIcon />
                  </IconButton>

                  <span className="text-lg">{date.getFullYear()}</span>

                  <IconButton color="inherit" 
                    disabled={nextMonthButtonDisabled}
                    onClick={() => increaseYear()}
                  >
                    <NavigateNextIcon />
                  </IconButton>
                </div>
              )}
            />
          </div>
          <div className="flex-1 flex justify-end items-center gap-2">
            <IconButton color="inherit"
              disabled={prevMonthButtonDisabled}
              onClick={() => decreaseMonth()}
            >
              <NavigateBeforeIcon />
            </IconButton>
            <IconButton color="inherit"
              disabled={nextMonthButtonDisabled}
              onClick={() => increaseMonth()}
            >
              <NavigateNextIcon />
            </IconButton>
          </div>
        </div>
      )}
      onCalendarOpen={() => {
        document.addEventListener('touchstart', (event: TouchEvent) => {
            event.stopPropagation();
        }, true);
      }}
      {...props}
    >
      {children}
    </RDatePicker>
  );
};

const MonthYearCustomInput = React.forwardRef(({ value, onClick }: any, ref) => {
  const open = React.useRef(false);

  return (
    <ClickAwayListener
      onClickAway={() => open.current = false}
    >
      <ButtonBase
        onClick={e => {
          if (!open.current)
            onClick();
          
          open.current = !open.current;
        }}
        ref={ref as any}
        className="!pl-3 !pr-1 !py-1 !rounded"
      >
        <span className="flex justify-center items-center gap-1 capitalize text-lg">
          {value}
          <ArrowDropDownIcon fontSize="small" />
        </span>
      </ButtonBase>
    </ClickAwayListener>
  );
});
MonthYearCustomInput.displayName = 'MonthYearCustomInput';

const SimpleCalendarContainer: React.FC<CalendarContainerProps> = ({
  className,
  children,
}) => {
  return (
    <div className="bg-white shadow-md rounded-2xl shadow-br pt-2">
      <CalendarContainer className={className}>{children}</CalendarContainer>
    </div>
  );
};

interface DatePresetsProps {
  onChange?: (
    date: [Date | null, Date | null], event: React.SyntheticEvent<any, Event> | undefined
  ) => void;
}

const DatePresets: React.FC<DatePresetsProps> = ({ 
  onChange 
}) => {

  const onTodayClick = React.useCallback(() => {
    const today = new Date();
    onChange && onChange([today, today], undefined);
  }, [onChange]);

  const onYesterdayClick = React.useCallback(() => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    onChange && onChange([yesterday, yesterday], undefined);
  }, [onChange]);

  const onLast7DaysClick = React.useCallback(() => {
    const start = new Date();
    const end = new Date();
    start.setDate(end.getDate() - 6);
    onChange && onChange([start, end], undefined);
  }, [onChange]);

  const onLastWeekClick = React.useCallback(() => {
    const start = new Date();
    const end = new Date();
    start.setDate(start.getDate() - start.getDay() - 7);
    end.setDate(start.getDate() + 6);
    onChange && onChange([start, end], undefined);
  }, [onChange]);

  const onLast30DaysClick = React.useCallback(() => {
    const start = new Date();
    const end = new Date();
    start.setDate(end.getDate() - 30);
    onChange && onChange([start, end], undefined);
  }, [onChange]);

  const onThisMonthClick = React.useCallback(() => {
    const start = new Date();
    start.setDate(1);
    const end = new Date(start);
    end.setMonth(end.getMonth() + 1);
    end.setDate(end.getDate() - 1);
    onChange && onChange([start, end], undefined);
  }, [onChange]);

  const onLastMonthClick = React.useCallback(() => {
    const start = new Date();
    start.setDate(1);
    start.setMonth(start.getMonth() - 1);
    const end = new Date(start);
    end.setMonth(end.getMonth() + 1);
    end.setDate(end.getDate() - 1);
    onChange && onChange([start, end], undefined);
  }, [onChange]);

  const onThisTriClick = React.useCallback(() => {
    const start = new Date();
    start.setDate(1);
    start.setMonth(Math.floor(start.getMonth() / 3) * 3);   
    const end = new Date(start);
    end.setMonth(end.getMonth() + 3);
    end.setDate(end.getDate() - 1);
    onChange && onChange([start, end], undefined);
  }, [onChange]);

  const onLastTriClick = React.useCallback(() => {
    const start = new Date();
    start.setDate(1);
    start.setMonth(Math.floor(start.getMonth() / 3) * 3 - 3);   
    const end = new Date(start);
    end.setMonth(end.getMonth() + 3);
    end.setDate(end.getDate() - 1);
    onChange && onChange([start, end], undefined);
  }, [onChange]);

  const onThisYearClick = React.useCallback(() => {
    const start = new Date();
    start.setDate(1);
    start.setMonth(0);
    const end = new Date(start);
    end.setMonth(end.getMonth() + 12);
    end.setDate(end.getDate() - 1);
    onChange && onChange([start, end], undefined);
  }, [onChange]);

  const onLastYearClick = React.useCallback(() => {
    const start = new Date();
    start.setDate(1);
    start.setMonth(0);
    const end = new Date(start);
    start.setFullYear(start.getFullYear() - 1);
    end.setDate(end.getDate() - 1);
    onChange && onChange([start, end], undefined);
  }, [onChange]);

  return (
    <div className="flex flex-col font-bold gap-1 text-neutral-800">
      <ButtonBase className="!rounded !px-2 whitespace-nowrap"
        onClick={onTodayClick}
      >
        Hoy
      </ButtonBase>
      <ButtonBase className="!rounded !px-2 whitespace-nowrap"
        onClick={onYesterdayClick}
      >
        Ayer
      </ButtonBase>
      <ButtonBase className="!rounded !px-2 whitespace-nowrap"
        onClick={onLast7DaysClick}
      >
        Últimos 7 días
      </ButtonBase>
      <ButtonBase className="!rounded !px-2 whitespace-nowrap"
        onClick={onLastWeekClick}
      >
        Semana pasada
      </ButtonBase>
      <ButtonBase className="!rounded !px-2 whitespace-nowrap"
        onClick={onLast30DaysClick}
      >
        Últimos 30 días
      </ButtonBase>
      <ButtonBase className="!rounded !px-2 whitespace-nowrap"
        onClick={onThisMonthClick}
      >
        Este mes
      </ButtonBase>
      <ButtonBase className="!rounded !px-2 whitespace-nowrap"
        onClick={onLastMonthClick}
      >
        Mes pasado
      </ButtonBase>
      <ButtonBase className="!rounded !px-2 whitespace-nowrap"
        onClick={onThisTriClick}
      >
        Este trimestre
      </ButtonBase>
      <ButtonBase className="!rounded !px-2 whitespace-nowrap"
        onClick={onLastTriClick}
      >
        Trimestre pasado
      </ButtonBase>
      <ButtonBase className="!rounded !px-2 whitespace-nowrap"
        onClick={onThisYearClick}
      >
        Este año
      </ButtonBase>
      <ButtonBase className="!rounded !px-2 whitespace-nowrap"
        onClick={onLastYearClick}
      >
        Año pasado
      </ButtonBase>
    </div>
  )
}