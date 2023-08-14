import React, { useState } from "react";
import Dialog from "@mui/material/Dialog";
import { textInputSx } from "./TextInput";
import TextField, { TextFieldProps } from "@mui/material/TextField";
import { format as formatDate, parseISO } from "date-fns";
import { utcToZonedTime } from "date-fns-tz";
import { es } from "date-fns/locale";

import { 
	DatePicker as DatePickerBase, 
	type DatePickerProps as DatePickerBaseProps 
} from "@/components/shared/hook-form";

import Calendar from '@mui/icons-material/CalendarMonth';

export interface DatePickerProps<
	WithRange extends boolean | undefined = undefined,
	CustomModifierNames extends string = never,
> extends Pick<TextFieldProps, "fullWidth" | "variant">,
Omit<DatePickerBaseProps<CustomModifierNames, WithRange>, 
	"inline" | "withPortal" | "showPopperArrow"> {

}

export const DatePicker = <
WithRange extends boolean | undefined = undefined,
CustomModifierNames extends string = never>({
	fullWidth, variant, onCalendarOpen, onCalendarClose, ...datePickerProps
}: DatePickerProps<WithRange, CustomModifierNames>) => {
	const [open, setOpen] = useState(false);

	const variantProp = variant === "filled" ? {
		disableUnderline: true
	  } : undefined;

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
			<span className={fullWidth ? "w-full" : ""}>
				<TextField
					fullWidth={fullWidth}
					onClick={onOpen}
					value={getDateString()}
					InputProps={{ 
						readOnly: true, 
						endAdornment: (
						<Calendar 
							className="text-neutral-800" 
							fontSize="small" 
						/>),
						...variantProp,
					}}
					sx={textInputSx}
					variant={variant}
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