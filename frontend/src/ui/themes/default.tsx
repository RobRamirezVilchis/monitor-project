import {
  createTheme, 
  PasswordInput,
  ColorInput,
  em,
  MantineSize,
} from "@mantine/core";
import { 
  DateInput, 
  DatePickerInput 
} from "@mantine/dates";

import fonts from "@/ui/fonts";

import { 
  IconCalendarEvent,
  IconColorPicker,
  IconEye,
  IconEyeOff,
} from "@tabler/icons-react";

const baseMantineSize: MantineSize = "sm";

const defaultTheme = createTheme({
  fontFamily: fonts.roboto.style.fontFamily,
  breakpoints: { 
    // Matching breakpoints with TailwindCSS
    // NOTE: TailwindCSS uses min-width, Mantine uses max-width
    // So to match TailwindCSS breakpoints in Mantine, we need to use one unit lower,
    // for example, a md breakpoint in TailwindCSS would be matched with sm in Mantine
    // and the base style in Tailwind would be bg-black, while in Mantine it would be bg: { base: "black" }
    xs: em(640),
    sm: em(768),
    md: em(1024),
    lg: em(1280),
    xl: em(1536),
  },
  headings: {
    fontFamily: fonts.roboto.style.fontFamily,
  },
  cursorType: "pointer",
  primaryShade: {
    light: 6,
    dark: 8,
  },
  colors: {
    // Tooltip bg color is given by the variable --tooltip-bg, or a shade of gray if it does not exist
    dark: [
      "#C1C2C5", // base text
      "#A6A7AB", // segmented control text
      "#909296",
      "#5C5F66",
      "#373A40", // borders/slider track and tooltip
      "#2C2E33", // kbd bg/variant="filled" input bg/selected segmented control bg/rating bg
      "#25262B", // input bg/popover bg/alert gb/notification bg/rating filled bg
      "#1A1B1E", // body bg/modal bg/paper bg
      "#141517", // segmented control bg
      "#101113",
    ],
  },
  components: {
    // Core
    Autocomplete: {
      defaultProps: {
        size: baseMantineSize,
      },
    },
    Checkbox: {
      defaultProps: {
        size: baseMantineSize,
      },
    },
    Chip: {
      defaultProps: {
        size: baseMantineSize,
      },
    },
    ColorInput: ColorInput.extend({
      defaultProps: {
        size: baseMantineSize,
        eyeDropperIcon: <IconColorPicker className="w-4 h-4" />,
      },
    }),
    ColorPicker: {
      defaultProps: {
        size: baseMantineSize,
      },
    },
    InputBase: {
      defaultProps: {
        size: baseMantineSize,
      },
    },
    FileInput: {
      defaultProps: {
        size: baseMantineSize,
      },
    },
    JsonInput: {
      defaultProps: {
        size: baseMantineSize,
      },
    },
    MultiSelect: {
      defaultProps: {
        size: baseMantineSize,
      },
    },
    NativeSelect: {
      defaultProps: {
        size: baseMantineSize,
      },
    },
    NumberInput: {
      defaultProps: {
        size: baseMantineSize,
      },
    },
    PasswordInput: PasswordInput.extend({
      defaultProps: {
        size: baseMantineSize,
        visibilityToggleIcon: ({ reveal }) => reveal 
          ? <IconEyeOff className="w-5 h-5" />
          : <IconEye className="w-5 h-5" />,
      },
    }),
    PinInput: {
      defaultProps: {
        size: baseMantineSize,
      },
    },
    Radio: {
      defaultProps: {
        size: baseMantineSize,
      },
    },
    Rating: {
      defaultProps: {
        size: baseMantineSize,
      },
    },
    SegmentedControl: {
      defaultProps: {
        size: baseMantineSize,
      },
    },
    Select: {
      defaultProps: {
        size: baseMantineSize,
      },
    },
    Slider: {
      defaultProps: {
        size: baseMantineSize,
      },
    },
    Switch: {
      defaultProps: {
        size: baseMantineSize,
      },
    },
    TagsInput: {
      defaultProps: {
        size: baseMantineSize,
      },
    },
    Textarea: {
      defaultProps: {
        size: baseMantineSize,
      },
    },
    TextInput: {
      defaultProps: {
        size: baseMantineSize,
      },
    },
    // Dates
    DateInput: DateInput.extend({
      defaultProps: {
        size: baseMantineSize,
        leftSection: <IconCalendarEvent className="w-5 h-5" />,
        leftSectionPointerEvents: "none",
      },
    }),
    DatePicker: {
      defaultProps: {
        size: baseMantineSize,
      },
    },
    DatePickerInput: DatePickerInput.extend({
      defaultProps: {
        size: baseMantineSize,
        leftSection: <IconCalendarEvent className="w-5 h-5" />,
        leftSectionPointerEvents: "none",
      },
    }),
    DateTimePicker: {
      defaultProps: {
        size: baseMantineSize,
        leftSection: <IconCalendarEvent className="w-5 h-5" />,
        leftSectionPointerEvents: "none",
      },
    },
    MonthPìcker: {
      defaultProps: {
        size: baseMantineSize,
      },
    },
    MonthPickerInput: {
      defaultProps: {
        size: baseMantineSize,
      },
    },
    TimeInput: {
      defaultProps: {
        size: baseMantineSize,
      },
    },
    YearPicker: {
      defaultProps: {
        size: baseMantineSize,
      },
    },
    YearPickerInput: {
      defaultProps: {
        size: baseMantineSize,
      },
    },
    // Other
    Button: {
      defaultProps: {
        size: baseMantineSize,
      },
    },
  },
});

export default defaultTheme;
