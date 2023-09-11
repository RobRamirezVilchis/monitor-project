"use client";

import {
  Button,
  Divider,
  Fieldset,
  Radio as _Radio,
} from "@mantine/core";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import {
  Checkbox,
  Chip,
  ColorInput,
  ColorPicker,
  FileInput,
  JsonInput,
  NativeSelect,
  NumberInput,
  PasswordInput,
  PinInput,
  Radio,
  Rating,
  SegmentedControl,
  Slider,
  Switch,
  Textarea,
  TextInput,
} from "@/components/ui/hook-form/core";

const schema = z.object({
  checkbox: z.boolean(),
  chip: z.boolean(),
  color: z.string().nonempty("The color is required"),
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
}).refine(v => v.checkbox === true, {
  message: "You must check the checkbox",
  path: ["checkbox"],
}).refine(v => v.switch === true, {
  message: "You must turn on the switch",
  path: ["switch"],
});

type Form = z.infer<typeof schema>;

const AppMantineUIPage = () => {
  const {
    control,
    formState: { isValid, isDirty, errors },
    handleSubmit,
    reset,
    watch,
  } = useForm<Form>({
    mode: "onTouched",
    defaultValues: {
      checkbox: false,
      chip: false,
      color: "",
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
    },
    resolver: zodResolver(schema),
  });
  const values = watch(); //! WARNING: This will rerender on every value change!!!

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
              />
            </Fieldset>

            <Fieldset legend="Chip" classNames={{ legend: "px-2 font-semibold" }}>
              <Chip
                name="chip"
                control={control}
              >
                Chip
              </Chip>
            </Fieldset>

            <Fieldset legend="ColorInput" classNames={{ legend: "px-2 font-semibold" }}>
              <ColorInput
                name="color"
                control={control}
                label="Color"
                placeholder="Pick a color"
              />
            </Fieldset>

            <Fieldset legend="ColorPicker" classNames={{ legend: "px-2 font-semibold" }}>
              <ColorPicker
                name="color"
                control={control}
                placeholder="Pick a color"
              />
            </Fieldset>

            <Fieldset legend="FileInput" classNames={{ legend: "px-2 font-semibold" }}>
              <FileInput<true, Form>
                name="files"
                control={control}
                placeholder="Pick a file"
                multiple
              />
            </Fieldset>

            <Fieldset legend="JsonInput" classNames={{ legend: "px-2 font-semibold" }}>
              <JsonInput
                name="json"
                control={control}
                label="Json"
                placeholder="Enter a json"
                rows={5}
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
              />
            </Fieldset>

            <Fieldset legend="NumberInput" classNames={{ legend: "px-2 font-semibold" }}>
              <NumberInput
                name="number"
                control={control}
                label="Name"
                placeholder="Enter a number"
              />
            </Fieldset>

            <Fieldset legend="PasswordInput" classNames={{ legend: "px-2 font-semibold" }}>
              <PasswordInput
                name="password"
                control={control}
                label="Password"
                placeholder="Enter your password"
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
              />
            </Fieldset>

            <Fieldset legend="Radio" classNames={{ legend: "px-2 font-semibold" }}>
              <Radio
                name="radio"
                control={control}
                label="Radio"
              />
            </Fieldset>

            <Fieldset legend="RadioGroup" classNames={{ legend: "px-2 font-semibold" }}>
              <Radio.Group
                name="radioGroup"
                control={control}
                label="Radio Group"
                description="This is a description"
              >
                <div className="flex gap-2 mt-2">
                  <_Radio value="Option1" label="Option1" />
                  <_Radio value="Option2" label="Option2" />
                  <_Radio value="Option3" label="Option3" />
                </div>
              </Radio.Group>
            </Fieldset>

            <Fieldset legend="Rating" classNames={{ legend: "px-2 font-semibold" }}>
              <Rating
                name="rating"
                control={control}
                fractions={2}
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
              />
            </Fieldset>

            <Fieldset legend="Slider" classNames={{ legend: "px-2 font-semibold" }}>
              <Slider
                name="slider"
                control={control}
                label={v => v}
              />
            </Fieldset>

            <Fieldset legend="Switch" classNames={{ legend: "px-2 font-semibold" }}>
              <Switch
                name="switch"
                control={control}
                label="Switch"
              />
            </Fieldset>

            <Fieldset legend="Textarea" classNames={{ legend: "px-2 font-semibold" }}>
              <Textarea
                name="textarea"
                control={control}
                label="Textarea"
                placeholder="Enter some text"
              />
            </Fieldset>

            <Fieldset legend="TextInput" classNames={{ legend: "px-2 font-semibold" }}>
              <TextInput
                name="text"
                control={control}
                label="Name"
                placeholder="Enter your name"
              />
            </Fieldset>
          </Fieldset>



          <div className="flex gap-4">
            <Button type="submit">
              Submit
            </Button>
            <Button type="button" onClick={setExampleValidValues}>
              Example valid values
            </Button>
          </div>
        </form>

        <div>
          <Fieldset legend="Form State" classNames={{ legend: "px-2 font-semibold" }}>
            <pre className="p-2">
              {JSON.stringify({
                isValid,
                isDirty,
                values: {
                  ...values,
                  files: (() => {
                    const files = values.files;
                    if (files === null) return null;
                    if (Array.isArray(files)) return files.map(f => f.name);
                    return files.name;
                  })(),
                },
                errors,
              }, null, 2)}
            </pre>
          </Fieldset>
        </div>
      </div>
    </div>
  );
}

export default AppMantineUIPage;

const ExampleValidValues: Form = {
  checkbox: true,
  chip: true,
  color: "#000000",
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
};
