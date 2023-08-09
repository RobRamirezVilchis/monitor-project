"use client";

import React, { useState } from "react";
import Dialog from "@mui/material/Dialog";
import InputBase, { InputBaseProps } from "@mui/material/InputBase";
import { format as formatDate } from "date-fns";
import { utcToZonedTime } from "date-fns-tz";
import { es } from "date-fns/locale";

import { 
	DatePicker as DatePickerBase, 
	type DatePickerProps as DatePickerBaseProps 
} from "./DatePicker";

import DateRangeOutlinedIcon from '@mui/icons-material/DateRangeOutlined';

export interface InlineDatePickerProps<
WithRange extends boolean | undefined = undefined,
CustomModifierNames extends string = never,
> 
extends Pick<InputBaseProps, "fullWidth">,
Omit<DatePickerBaseProps<CustomModifierNames, WithRange>, 
	"inline" | "withPortal" | "showPopperArrow"> {

}

export const InlineDatePicker = <
WithRange extends boolean | undefined = undefined,
CustomModifierNames extends string = never>({
	fullWidth, onCalendarOpen, onCalendarClose, ...datePickerProps
}: InlineDatePickerProps<WithRange, CustomModifierNames>) => {
	const [open, setOpen] = useState(false);

	const getDateString = () => {
    const renderEndDate = datePickerProps.endDate && datePickerProps.startDate !== datePickerProps.endDate;

		return `${datePickerProps.startDate
			? formatDate(datePickerProps.startDate, "dd/MM/yy", { locale: es })
			: ""}${renderEndDate ? " - " : ""}${
				renderEndDate
			? formatDate(datePickerProps.endDate!, "dd/MM/yy", { locale: es })
			: ""
			}`;
	};

	const onOpen = () => {
		setOpen(true);
		onCalendarOpen && onCalendarOpen();
	};

	const onClose = () => {
		setOpen(false);
		if (datePickerProps.selectsRange && datePickerProps.startDate && !datePickerProps.endDate && !!datePickerProps.onChange)
			datePickerProps.onChange([datePickerProps.startDate, datePickerProps.startDate] as any, undefined);
		onCalendarClose && onCalendarClose();
	};

	return (
		<>
			<span className={`relative ${fullWidth ? "w-full" : ""}`}>
				<InputBase
					className="shadow-md rounded-2xl pl-4 pr-8 py-2 bg-white"
					fullWidth={fullWidth}
					readOnly
					onClick={onOpen}
					value={getDateString()}
				/>
				<DateRangeOutlinedIcon 
					className="text-neutral-800 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" 
					fontSize="small" 
				/>
			</span>

			<Dialog
				open={open}
				onClose={onClose}
				classes={{
					paper: "!rounded-2xl"
				}}
			>
				<DatePickerBase
					inline
					{...datePickerProps}
				/>
			</Dialog>
		</>
	);
}