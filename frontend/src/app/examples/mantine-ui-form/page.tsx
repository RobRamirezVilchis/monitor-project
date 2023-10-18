"use client";

import {
  Autocomplete as _Autocomplete,
  Select as _Select,
  Button,
  Divider,
  Fieldset,
  Radio as _Radio,
  ActionIcon,
  useMantineTheme,
} from "@mantine/core";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import {
  Autocomplete,
  Checkbox,
  Chip,
  ColorInput,
  ColorPicker,
  IMaskInput,
  FileInput,
  JsonInput,
  MultiSelect,
  NativeSelect,
  NumberInput,
  PasswordInput,
  PinInput,
  Radio,
  Rating,
  SegmentedControl,
  Select,
  Slider,
  Switch,
  TagsInput,
  Textarea,
  TextInput,
} from "@/components/ui/core";
import {
  DateInput,
  DatePicker,
  DatePickerInput,
  DateTimePicker,
  MonthPicker,
  MonthPickerInput,
  TimeInput,
  YearPicker,
  YearPickerInput,
} from "@/components/ui/dates";
import { useRef, useState } from "react";
import { DatePickerValue } from "@mantine/dates";
import { useMediaQuery } from "@mantine/hooks";
import DateRangePresets, { DateRangePresetsList } from "@/components/ui/dates/DateRangePresets";

import AccessTimeIcon from "@mui/icons-material/AccessTime";

const schema = z.object({
  checkbox: z.boolean(),
  chip: z.boolean(),
  colorInput: z.string().nonempty("The color is required"),
  colorPicker: z.string().nonempty("The color is required"),
  mask: z.string().nonempty("The mask is required"),
  files: z.union([z.custom<File>(), z.array(z.custom<File>()), z.null()]),
  json: z.string().nonempty("The json is required"),
  selectNative: z.string().nonempty("The selectNative is required"),
  number: z.number().min(0, "The number must be greater than or equal to 0"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
  pin: z.string().length(4, "Pin must be exactly 4 characters long"),
  radio: z.boolean(),
  radioGroup: z.string().nonempty("The radioGroup is required"),
  rating: z.number(),
  segmented: z.string(),
  slider: z.number(),
  switch: z.boolean(),
  textarea: z.string().nonempty("The textarea is required"),
  text: z.string().nonempty("The text is required"),

  autocomplete: z.string().nonempty("The autocomplete is required"),
  multiselect: z.array(z.string()).nonempty("The multiselect is required"),
  select: z.string().nonempty("The select is required"),
  tags: z.array(z.string()).nonempty("The tags is required"),

  dateInput: z.nullable(z.date()),
  datePicker: z.nullable(z.date()),
  datePickerMultiple: z.custom<DatePickerValue<"multiple">>(),
  datePickerInput: z.custom<DatePickerValue<"range">>(),
  dateTimePicker: z.nullable(z.date()),
  monthPicker: z.nullable(z.date()),
  monthPickerMultiple: z.custom<DatePickerValue<"multiple">>(),
  monthPickerRange: z.custom<DatePickerValue<"range">>(),
  monthPickerInput: z.nullable(z.date()),
  timeInput: z.string().regex(/^[\d]{2}:[\d]{2}/, "The time is required"),
  yearPicker: z.nullable(z.date()),
  yearPickerMultiple: z.custom<DatePickerValue<"multiple">>(),
  yearPickerRange: z.custom<DatePickerValue<"range">>(),
  yearPickerInput: z.nullable(z.date()),

}).partial(/* To reach .refine on validation fails */).refine(({checkbox}) => checkbox, {
  message: "You must check the checkbox",
  path: ["checkbox"],
}).refine(({radio}) => radio, { 
  message: "You must check the radio",
  path: ["radio"],
}).refine(({switch: s}) => s, {
  message: "You must check the switch",
  path: ["switch"],
}).refine(({dateInput}) => dateInput !== null, {
  message: "You must select a date",
  path: ["dateInput"],
}).refine(({datePicker}) => datePicker !== null, {
  message: "You must select a date",
  path: ["datePicker"],
}).refine(({datePickerInput}) => datePickerInput && datePickerInput.every(x => !!x), {
  message: "You must select a date range",
  path: ["datePickerInput"],
}).refine(({dateTimePicker}) => dateTimePicker !== null, {
  message: "You must select a date and time",
  path: ["dateTimePicker"],
}).refine(({monthPicker}) => monthPicker !== null, {
  message: "You must select a month",
  path: ["monthPicker"],
}).refine(({monthPickerInput}) => monthPickerInput !== null, {
  message: "You must select a month range",
  path: ["monthPickerInput"],
}).refine(({yearPicker}) => yearPicker !== null, {
  message: "You must select a year",
  path: ["yearPicker"],
}).refine(({yearPickerInput}) => yearPickerInput !== null, {
  message: "You must select a year range",
  path: ["yearPickerInput"],
});

type Form = Required<z.infer<typeof schema>>;

const AppMantineUIPage = () => {
  const theme = useMantineTheme();
  const mobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`, true);
  const size = undefined; // mobile ? "lg" : "sm";

  const {
    control,
    formState: { isValid, isDirty, errors },
    handleSubmit,
    reset,
    watch,
    setFocus,
    setValue,
  } = useForm<Form>({
    mode: "onTouched",
    defaultValues: {
      checkbox: false,
      chip: false,
      colorInput: "",
      colorPicker: "",
      mask: "",
      files: null,
      json: "",
      selectNative: "",
      number: 0,
      password: "",
      pin: "",
      radio: false,
      radioGroup: "",
      rating: 0,
      segmented: "s1",
      slider: 0,
      switch: false,
      text: "",

      autocomplete: "",
      multiselect: [],
      select: "",
      tags: [],

      dateInput: null,
      datePicker: null,
      datePickerMultiple: [],
      datePickerInput: [null, null],
      dateTimePicker: null,
      monthPicker: null,
      monthPickerMultiple: [],
      monthPickerRange: [null, null],
      monthPickerInput: null,
      timeInput: "",
      yearPicker: null,
      yearPickerMultiple: [],
      yearPickerRange: [null, null],
      yearPickerInput: null,
    },
    resolver: zodResolver(schema),
  });
  const values: Partial<Form> = mobile ? {} : watch(); //! WARNING: This will rerender on every value change!!!

  const [focusName, setFocusName] = useState<string | null>("");

  //* Time Input props:
  const timeInputRef = useRef<HTMLInputElement>(null);

  const pickerControl = (
    <ActionIcon variant="subtle" color="gray" onClick={() => timeInputRef.current?.showPicker()}>
      <AccessTimeIcon fontSize="small" />
    </ActionIcon>
  );
  //* -----------------

  const onValid = (values: Form) => {
    console.log(values);
  };

  const onInvalid = (errors: any, event: any) => {
    console.log(errors);
  };

  const setExampleValidValues = () => {
    reset(ExampleValidValues);
  };

  return (
    <div className="p-2">
      <h1 className="text-2xl font-semibold">Mantine UI x React Hook Form</h1>
      <Divider className="mb-4" />

      <div className="grid grid-cols-2 gap-2">
        <form
          onSubmit={handleSubmit(onValid, onInvalid)}
          className="flex flex-col gap-2"
        >
          <Fieldset legend="Inputs"
            classNames={{ 
              root: "flex flex-col gap-3",
              legend: "px-2" 
            }}
          >
            <Fieldset legend="Checkbox" classNames={{ legend: "px-2 font-semibold" }}>
              <Checkbox
                name="checkbox"
                control={control}
                label="Agree to terms and conditions"
                size={size}
              />
            </Fieldset>

            <Fieldset legend="Chip" classNames={{ legend: "px-2 font-semibold" }}>
              <Chip
                name="chip"
                control={control}
                size={size}
              >
                Chip
              </Chip>
            </Fieldset>

            <Fieldset legend="ColorInput" classNames={{ legend: "px-2 font-semibold" }}>
              <ColorInput
                name="colorInput"
                control={control}
                label="Color"
                placeholder="Pick a color"
                size={size}
              />
            </Fieldset>

            <Fieldset legend="ColorPicker" classNames={{ legend: "px-2 font-semibold" }}>
              <ColorPicker
                name="colorPicker"
                control={control}
                placeholder="Pick a color"
                size={size}
              />
            </Fieldset>
            
            <Fieldset legend="IMaskInput" classNames={{ legend: "px-2 font-semibold" }}>
              <IMaskInput
                name="mask"
                control={control}
                label="Phone Mask"
                placeholder="Phone Mask"

                mask="(#00) 000-0000"
                unmask
                definitions={{
                  "#": /[1-9]/,
                }}
                overwrite
              />
            </Fieldset>

            <Fieldset legend="FileInput" classNames={{ legend: "px-2 font-semibold" }}>
              <FileInput<true, Form>
                name="files"
                control={control}
                placeholder="Pick a file"
                multiple
                size={size}
              />
            </Fieldset>

            <Fieldset legend="JsonInput" classNames={{ legend: "px-2 font-semibold" }}>
              <JsonInput
                name="json"
                control={control}
                label="Json"
                placeholder="Enter a json"
                rows={5}
                size={size}
              />
            </Fieldset>

            <Fieldset legend="NativeSelect" classNames={{ legend: "px-2 font-semibold" }}>
              <NativeSelect
                name="selectNative"
                control={control}
                label="Native Select"
                data={[
                  {
                    label: "Select an option...",
                    value: "",
                    disabled: true,
                  },
                  "Option1", 
                  {
                    group: "Group",
                    items: [
                      "Option2",
                      "Option3",
                    ],

                  }
                ]}
                size={size}
              />
            </Fieldset>

            <Fieldset legend="NumberInput" classNames={{ legend: "px-2 font-semibold" }}>
              <NumberInput
                name="number"
                control={control}
                label="Name"
                placeholder="Enter a number"
                size={size}
              />
            </Fieldset>

            <Fieldset legend="PasswordInput" classNames={{ legend: "px-2 font-semibold" }}>
              <PasswordInput
                name="password"
                control={control}
                label="Password"
                placeholder="Enter your password"
                size={size}
              />
            </Fieldset>

            <Fieldset legend="PinInput" classNames={{ legend: "px-2 font-semibold" }}>
              <PinInput
                name="pin"
                control={control}
                placeholder="-"
                inputType="tel"
                inputMode="numeric"
                type={/^[\d]+/}
                size={size}
              />
            </Fieldset>

            <Fieldset legend="Radio" classNames={{ legend: "px-2 font-semibold" }}>
              <Radio
                name="radio"
                control={control}
                label="Radio"
                size={size}
              />
            </Fieldset>

            <Fieldset legend="RadioGroup" classNames={{ legend: "px-2 font-semibold" }}>
              <Radio.Group
                name="radioGroup"
                control={control}
                label="Radio Group"
                description="This is a description"
                size={size}
              >
                <div className="flex gap-2 mt-2">
                  <_Radio value="Option1" label="Option1" size={size} />
                  <_Radio value="Option2" label="Option2" size={size} />
                  <_Radio value="Option3" label="Option3" size={size} />
                </div>
              </Radio.Group>
            </Fieldset>

            <Fieldset legend="Rating" classNames={{ legend: "px-2 font-semibold" }}>
              <Rating
                name="rating"
                control={control}
                fractions={2}
                size={size}
              />
            </Fieldset>

            <Fieldset legend="SegmentedControl" classNames={{ legend: "px-2 font-semibold" }}>
              <SegmentedControl
                name="segmented"
                control={control}
                data={[
                  { label: "Segment 1", value: "s1" },
                  { label: "Segment 2", value: "s2" },
                  { label: "Segment 3", value: "s3" },
                ]}
                size={size}
              />
            </Fieldset>

            <Fieldset legend="Slider" classNames={{ legend: "px-2 font-semibold" }}>
              <Slider
                name="slider"
                control={control}
                label={v => v}
                size={size}
              />
            </Fieldset>

            <Fieldset legend="Switch" classNames={{ legend: "px-2 font-semibold" }}>
              <Switch
                name="switch"
                control={control}
                label="Switch"
                size={size}
              />
            </Fieldset>

            <Fieldset legend="Textarea" classNames={{ legend: "px-2 font-semibold" }}>
              <Textarea
                name="textarea"
                control={control}
                label="Textarea"
                placeholder="Enter some text"
                size={size}
              />
            </Fieldset>

            <Fieldset legend="TextInput" classNames={{ legend: "px-2 font-semibold" }}>
              <TextInput
                name="text"
                control={control}
                label="Name"
                placeholder="Enter your name"
                size={size}
              />
            </Fieldset>
          </Fieldset>

          <Fieldset legend="Combobox"
            classNames={{ 
              root: "flex flex-col gap-3",
              legend: "px-2" 
            }}
          >
            <Fieldset legend="Autocomplete" classNames={{ legend: "px-2 font-semibold" }}>
              <Autocomplete
                name="autocomplete"
                control={control}
                label="Autocomplete"
                placeholder="Enter something"
                data={[
                  "Option 1",
                  {
                    group: "Group",
                    items: [
                      "Option 2",
                      "Option 3",
                    ],
                  },
                ]}
                size={size}
              />
            </Fieldset>

            <Fieldset legend="MultiSelect" classNames={{ legend: "px-2 font-semibold" }}>
              <MultiSelect
                name="multiselect"
                control={control}
                label="MultiSelect"
                placeholder="Enter something"
                data={[
                  "Option 1",
                  {
                    group: "Group",
                    items: [
                      "Option 2",
                      "Option 3",
                    ],
                  },
                ]}
                size={size}
              />
            </Fieldset>

            <Fieldset legend="Select" classNames={{ legend: "px-2 font-semibold" }}>
              <Select
                name="select"
                control={control}
                label="Select"
                placeholder="Enter something"
                data={[
                  "Option 1",
                  {
                    group: "Group",
                    items: [
                      "Option 2",
                      "Option 3",
                    ],
                  },
                ]}
                size={size}
              />
            </Fieldset>

            <Fieldset legend="TagsInput" classNames={{ legend: "px-2 font-semibold" }}>
              <TagsInput
                name="tags"
                control={control}
                label="TagsInput"
                placeholder="Enter something"
                data={[
                  {
                    group: "Suggestions",
                    items: [
                      "Tag 1",
                      "Tag 2",
                      "Tag 3",
                    ],
                  },
                ]}
                size={size}
              />
            </Fieldset>
          </Fieldset>

          <Fieldset legend="Dates"
            classNames={{ 
              root: "flex flex-col gap-3",
              legend: "px-2" 
            }}
          >
            <Fieldset legend="DateInput" classNames={{ legend: "px-2 font-semibold" }}>
              <DateInput
                name="dateInput"
                control={control}
                label="DateInput"
                placeholder="Enter something"
                size={size}
              />
            </Fieldset>

            <Fieldset legend="DatePicker" classNames={{ legend: "px-2 font-semibold" }}>
              <DatePicker
                name="datePicker"
                control={control}
                placeholder="Enter something"
                size={size}
              />
            </Fieldset>

            <Fieldset legend="DatePicker (multiple)" classNames={{ legend: "px-2 font-semibold" }}>
              <DatePicker
                name="datePickerMultiple"
                control={control}
                type="multiple"
                size={size}
              />
            </Fieldset>

            <Fieldset legend="DatePicker (range)" classNames={{ legend: "px-2 font-semibold" }}>
              <div className="flex gap-1">
                <DatePicker
                  name="datePickerInput"
                  control={control}
                  type="range"
                  size={size}
                />

                <DateRangePresetsList 
                  onPresetClick={(value) => {
                    setValue("datePickerInput", value);
                    console.log(value)
                  }} 
                  classNames={{
                    item: "bg-transparent hover:bg-gray-100",
                  }}
                />
              </div>
            </Fieldset>

            <Fieldset legend="DatePickerInput (range)" classNames={{ legend: "px-2 font-semibold" }}>
              <div className="flex items-center gap-2">
                <DatePickerInput
                  type="range"
                  name="datePickerInput"
                  control={control}
                  label="DatePickerInput"
                  placeholder="Enter something"
                  size={size}
                  className="flex-1"
                  rightSection={
                    <DateRangePresets
                      onPresetClick={(value) => {
                        setValue("datePickerInput", value);
                        console.log(value)
                      }} 
                      actionIconProps={{
                        variant: "subtle",
                        color: "gray",
                      }}
                      iconProps={{
                        className: "w-5 h-5"
                      }}
                    />
                  }
                  rightSectionPointerEvents="auto"
                />
              </div>
            </Fieldset>

            <Fieldset legend="DateTimePicker" classNames={{ legend: "px-2 font-semibold" }}>
              <DateTimePicker
                name="dateTimePicker"
                control={control}
                label="DateTimePicker"
                placeholder="Enter something"
                size={size}
              />
            </Fieldset>

            <Fieldset legend="MonthPicker" classNames={{ legend: "px-2 font-semibold" }}>
              <MonthPicker
                name="monthPicker"
                control={control}
                size={size}
              />
            </Fieldset>

            <Fieldset legend="MonthPicker (multiple)" classNames={{ legend: "px-2 font-semibold" }}>
              <MonthPicker
                name="monthPickerMultiple"
                control={control}
                type="multiple"
                size={size}
              />
            </Fieldset>

            <Fieldset legend="MonthPicker (range)" classNames={{ legend: "px-2 font-semibold" }}>
              <MonthPicker
                name="monthPickerRange"
                control={control}
                type="range"
                size={size}
              />
            </Fieldset>

            <Fieldset legend="MonthPickerInput" classNames={{ legend: "px-2 font-semibold" }}>
              <MonthPickerInput
                name="monthPickerInput"
                control={control}
                label="MonthPickerInput"
                placeholder="Enter something"
                size={size}
              />
            </Fieldset>

            <Fieldset legend="YearPicker" classNames={{ legend: "px-2 font-semibold" }}>
              <YearPicker
                name="yearPicker"
                control={control}
                size={size}
              />
            </Fieldset>

            <Fieldset legend="YearPicker (multiple)" classNames={{ legend: "px-2 font-semibold" }}>
              <YearPicker
                name="yearPickerMultiple"
                control={control}
                type="multiple"
                size={size}
              />
            </Fieldset>

            <Fieldset legend="YearPicker (range)" classNames={{ legend: "px-2 font-semibold" }}>
              <YearPicker
                name="yearPickerRange"
                control={control}
                type="range"
                size={size}
              />
            </Fieldset>

            <Fieldset legend="YearPickerInput" classNames={{ legend: "px-2 font-semibold" }}>
              <YearPickerInput
                name="yearPickerInput"
                control={control}
                label="YearPickerInput"
                placeholder="Enter something"
                size={size}
              />
            </Fieldset>

            <Fieldset legend="TimeInput" classNames={{ legend: "px-2 font-semibold" }}>
              <TimeInput
                name="timeInput"
                control={control}
                label="TimeInput"
                placeholder="Enter something"
                inputRef={timeInputRef}
                rightSection={pickerControl}
                size={size}
              />
            </Fieldset>

          </Fieldset>


          <div className="flex gap-4">
            <Button type="submit" size={size}>
              Submit
            </Button>
            <Button type="button" onClick={setExampleValidValues} size={size}>
              Example valid values
            </Button>
          </div>

            <div className="mt-[100vh] flex gap-2 items-center">
              <Button
                type="button"
                onClick={() => {
                  setFocus(focusName as any);
                }}
                size={size}
              >
                Focus
              </Button>
              <_Select
                value={focusName}
                onChange={setFocusName}
                className="flex-1"
                data={[
                  "checkbox",
                  "chip",
                  "colorInput",
                  "colorPicker",
                  "files",
                  "json",
                  "selectNative",
                  "number",
                  "password",
                  "pin",
                  "radio",
                  "radioGroup",
                  "rating",
                  "segmented",
                  "slider",
                  "switch",
                  "textarea",
                  "text",
                  "autocomplete",
                  "multiselect",
                  "select",
                  "tags",
                ]}
                size={size}
              />
          </div>
        </form>

        <div>
          {!mobile ? (
            <Fieldset legend="Form State" classNames={{ legend: "px-2 font-semibold" }}>
              <pre className="p-2">
                {JSON.stringify({
                  isValid,
                  isDirty,
                  values: {
                    ...values,
                    files: (() => {
                      const files = values?.files;
                      if (files === null) return null;
                      if (Array.isArray(files)) return files.map(f => f.name);
                      return files?.name;
                    })(),
                  },
                  errors,
                }, null, 2)}
              </pre>
            </Fieldset>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default AppMantineUIPage;

const ExampleValidValues: Form = {
  checkbox: true,
  chip: true,
  colorInput: "#000000",
  colorPicker: "#000000",
  mask: "1234567890",
  files: null,
  json: "{}",
  selectNative: "Option1",
  number: 1,
  password: "password",
  pin: "1234",
  radio: true,
  radioGroup: "Option1",
  rating: 4.5,
  segmented: "s1",
  slider: 50,
  switch: true,
  textarea: "Textarea",
  text: "John Doe",

  autocomplete: "Option 1",
  multiselect: ["Option 1"],
  select: "Option 1",
  tags: ["Tag 1"],

  dateInput: new Date(),
  datePicker: new Date(),
  datePickerMultiple: [new Date()],
  datePickerInput: [new Date(), new Date()],
  dateTimePicker: new Date(),
  monthPicker: new Date(),
  monthPickerMultiple: [new Date()],
  monthPickerRange: [new Date(), new Date()],
  monthPickerInput: new Date(),
  timeInput: "12:00",
  yearPicker: new Date(),
  yearPickerMultiple: [new Date()],
  yearPickerRange: [new Date(), new Date()],
  yearPickerInput: new Date(),
};
