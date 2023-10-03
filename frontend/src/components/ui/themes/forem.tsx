import "@/styles/forem.css";
import {
  createTheme, 
  PasswordInput,
  ColorInput,
} from "@mantine/core";

import fonts from "@/components/ui/fonts";

import { 
  IconColorPicker,
  IconEye,
  IconEyeOff,
} from "@tabler/icons-react";

const foremTheme = createTheme({
  fontFamily: fonts.roboto.style.fontFamily,
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

export default foremTheme;