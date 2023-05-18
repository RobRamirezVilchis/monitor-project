"use client";

import React, { useState } from "react";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";

import {
  Form,
} from "@/components/shared/inputs";
import {
  Autocomplete, TextInput, RadioGroup, Switch, 
  Checkbox, CheckboxGroup, Select, TimePicker, DatePicker, InlineDatePicker
} from "@/components/shared/inputs";
import logger from "@/utils/logger";

import AccountCircleIcon from '@mui/icons-material/AccountCircle';

type TestObj = {
  id: number;
  name: string;
}

const testList: TestObj[] = [
  { id: 1, name: "item 1" },
  { id: 2, name: "item 2" },
  { id: 3, name: "item 3" },
];

interface IFormProps {
  username: string;
  password: string;
  tel: string;
  time: string;
  time2: Date;
  time3: Date;
  time4: Date;
  amount: number;
  select: number | "";
  select2: number | "";
  autocomplete: string;
  autocomplete2: string | null;
  autocomplete3: TestObj | null;
  checkbox: boolean;
  switch: boolean;
  // Checkbox groups can be represented as objects or arrays
  // See the component instantiation to see how the differentiate,
  // if the name is a string, the result will be an object, if the name
  // is a number or can be cast into it, it will be an array
  cbGroup: {
    v1: boolean;
    v2: boolean;
    v3: boolean;
  };
  cbGroup2: boolean[];
  radios: string;
}


const FormTest = () => {

  const [formError, setFormError] = useState<string | null>(null);
  const [renderA, setRenderA] = useState(true);
  const [time, setTime] = useState(new Date());
  const [fileProgress, setFileProgress] = useState(-1);
  
  const [testDate, setTestDate] = useState<Date | null>(new Date());
  const [testStartDate, setTestStartDate] = useState<Date | null>(new Date());
  const [testEndDate, setTestEndDate] = useState<Date | null>(new Date());

  const onSubmit = (values: IFormProps) => {
    logger.debug(values);

    // Set error on bad response from the server...
    // setFormError("Bad input");
  };

  const onInvalidSubmit = (_: any) => {
    setFormError("Fix the errors in the form");
  };

  return (
    <Form<IFormProps>
      onValidSubmit={onSubmit}
      onInvalidSubmit={onInvalidSubmit}
      classes={{ form: "flex flex-col gap-1 items-start mx-1 w-[350px]" }}
      formError={formError}
      onFormErrorClear={() => setFormError(null)}
      formProps={{
        mode: "onTouched",
        defaultValues: {
          username: "admin",
          password: "password",
          tel: "5558796425",
          time: "120000",
          time2: new Date(),
          time3: new Date(),
          time4: new Date(2023, 1, 1, 0, 0, 0, 0),
          amount: 1000,
          select: 1,
          select2: 2,
          autocomplete: "search",
          autocomplete2: "two",
          autocomplete3: testList[1],
          checkbox: true,
          switch: true,
          cbGroup: {
            v1: true,
            v2: false,
            v3: true,
          },
          cbGroup2: [false, true, false],
          radios: "v0",
        },
      }}
    >
      {(
        formMethods,
        errorMsg
      ) => {
        const { formState, setValue } = formMethods;

        return (
        <>
          <TextInput<IFormProps>
            name="username"
            title="Nombre de usuario"
            rules={{
              required: "This field is required",
              maxLength: {
                value: 10,
                message: "The value should be shorter than 10 chars",
              },
              minLength: {
                value: 3,
                message: "The value should be bigger than 3 chars",
              },
            }}
            helperText=" "
            fullWidth
          />
          <TextInput<IFormProps>
            name="password"
            title="Contraseña"
            rules={{
              required: "This field is required",
              minLength: {
                value: 6,
                message: "The password must have at least 6 characters",
              },
            }}
            type="password"
            helperText="Password"
            showPasswordToggle
            fullWidth
            variant="filled"
          />
          <TextInput<IFormProps> // Using React IMask
            name="tel"
            type="tel"
            placeholder="(100) 000-0000"
            rules={{
              required: "This field is required",
              minLength: {
                value: 10,
                message: "Please provide a valid number"
              },
            }}
            helperText="Tel"
            fullWidth
            variant="filled"
          />
          <TextInput<IFormProps> // Using React IMask
            name="time"
            type="tel"
            placeholder="00:00:00 h"
            rules={{
              required: "This field is required",
            }}
            helperText="Time"
            fullWidth
            variant="filled"
          />
          <TextInput<IFormProps> // Using React Numeric Format
            name="amount"
            type="tel"
            rules={{
              required: "This field is required",
              maxLength: {
                value: 10,
                message: "Please provide a valid amount"
              },
              validate: {
                min1000: (v: number) => v >= 1000 || "Min value is $1,000"
              },
            }}
            helperText="Amount"
            fullWidth
            disabled
          />
          <Select<IFormProps>
            name="select"
            title="Selecciona una opción"
            rules={{ required: "Select an option" }}
            fullWidth
            helperText="Hola"
            placeholder={<div>Select something</div>}
          >
            <MenuItem value={1}><div>Hola</div></MenuItem>
            <MenuItem value={2}><div>Adios</div></MenuItem>
          </Select>
          <Select<IFormProps>
            name="select2"
            rules={{ required: "Select an option" }}
            fullWidth
            helperText="Hola"
            placeholder={<div>Select something</div>}
            disablePlaceholder
            variant="filled"
          >
            <MenuItem value={1}><div>Hola</div></MenuItem>
            <MenuItem value={2}><div>Adios</div></MenuItem>
          </Select>
          <Autocomplete<string, true, true, IFormProps>
            options={["one", "two", "three"]}
            title="Autocomplete 1"
            fullWidth
            helperText="foo"
            rules={{ required: "This field is required" }}
            name="autocomplete"
            freeSolo
          />
          <Autocomplete<string, true, false, IFormProps>
            rules={{ required: "This field is required" }}
            name="autocomplete2"
            options={["one", "two", "three"]}
            fullWidth
            helperText="foo"
            // disableClearable
            // popupIcon={""}
          />
          <Autocomplete<TestObj, true, false, IFormProps>
            rules={{ required: "This field is required", validate: { custom: v => v.id != 1 || "No 1" } }}
            name="autocomplete3"
            options={testList}
            getOptionLabel={(opt) => opt.name}
            isOptionEqualToValue={(opt, v) => opt === null || opt.id === v.id}
            fullWidth
            helperText="foo"
            // disableClearable
          />
          <Checkbox<IFormProps>
            name="checkbox"
            className="ml-3"
            rules={{
              required: "This checkbox is required"
            }}
            label="Checkbox"
            title="Selecciona este campo"
            helperText=" "
          />
          <Switch<IFormProps>
            name="switch"
            title="Selecciona este campo"
            rules={{
              required: "This checkbox is required",
            }}
            label="Switch"
            helperText=" "
          />
          <RadioGroup<IFormProps>
            name="radios"
            options={[
              { label: "Opt 1", value: "v0" },
              { label: "Opt 2", value: "v1" },
              { label: "Opt 3", value: "v2" },
            ]}
            rules={{
              validate: {
                required: (v: string) => !!v
                  || "Please select an option"
              }
            }}
            helperText=" "
            row
          />
          <CheckboxGroup<IFormProps>
            name="cbGroup"
            options={[
              { label: "Opt 1", name: "v1", checked: false },
              { label: "Opt 2", name: "v2", checked: true  },
              { label: "Opt 3", name: "v3", checked: false },
            ]}
            rules={{
              validate: {
                required: (values: object) =>  Object.values(values).some(v => v)
                  || "At least one checkbox must be checked"
              }
            }}
            helperText=" "
          />
          {renderA ? (
            <CheckboxGroup<IFormProps>
              name="cbGroup2"
              options={[
                { label: "Opt 1", name: 0, checked: false },
                { label: "Opt 2", name: 1, checked: true  },
                { label: "Opt 3", name: 2, checked: false },
              ]}
              rules={{
                validate: {
                  required: (values: boolean[]) => values.some(v => v)
                    || "At least one checkbox must be checked"
                }
              }}
              helperText=" "
              row
              shouldUnregisterField
              defaultFieldValue={[false, true, false]}
            />
          ) : null}

          <TimePicker 
            label=" "
            name="time4"
            helperText=" "
            rules={{
              validate: {
                min4pm: (value: Date) => value.getHours() >= 16 || "Min h is 4 pm" 
              }
            }}
          />

          {errorMsg ? <span>{errorMsg}</span> : null}

          <div className=""></div>

          <Button type="submit" className="mt-32">Submit</Button>

          <Button
            type="button"
            onClick={() => {
              // setValue("password", "password", { shouldValidate: true })
              setRenderA(!renderA);
              logger.debug(time);
            }}
          >
            Hola
          </Button>

          <DatePicker<true>
            selectsRange
            selected={testStartDate}
            startDate={testStartDate}
            endDate={testEndDate}
            disabledKeyboardNavigation
            onChange={([sd, ed]) => {
              setTestStartDate(sd);
              setTestEndDate(ed);
              logger.debug(sd, ed)
            }}
            showPopperArrow={false}
            withPortal
            calendarStartDay={0}
          />

          <DatePicker<true>
            inline
            selectsRange
            selected={testStartDate}
            startDate={testStartDate}
            endDate={testEndDate}
            disabledKeyboardNavigation
            onChange={([sd, ed]) => {
              setTestStartDate(sd);
              setTestEndDate(ed);
              logger.debug(sd, ed)
            }}
            showPopperArrow={false}
            calendarStartDay={0}
          />

          <InlineDatePicker<true>
            selectsRange
            selected={testStartDate}
            startDate={testStartDate}
            endDate={testEndDate}
            disabledKeyboardNavigation
            onChange={([sd, ed]) => {
              setTestStartDate(sd);
              setTestEndDate(ed);
              logger.debug(sd, ed)
            }}
            calendarStartDay={0}
          />
          
          <div className="my-10"></div>
        </>
      )}}
    </Form>
  );
}

export default FormTest;