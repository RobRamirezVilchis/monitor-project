import {
  createTheme, 
  PasswordInput,
  ColorInput,
  em,
} from "@mantine/core";

import fonts from "@/components/ui/fonts";

import { 
  IconColorPicker,
  IconEye,
  IconEyeOff,
} from "@tabler/icons-react";

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
  components: {
    ColorInput: ColorInput.extend({
      defaultProps: {
        eyeDropperIcon: <IconColorPicker className="w-4 h-4" />,
      },
    }),
    PasswordInput: PasswordInput.extend({
      defaultProps: {
        visibilityToggleIcon: ({ reveal }) => reveal 
          ? <IconEyeOff className="w-5 h-5" />
          : <IconEye className="w-5 h-5" />,
      },
    }),
  },
});

export default defaultTheme;