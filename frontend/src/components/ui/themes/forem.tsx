import "@/styles/forem.css";
import {
  createTheme, 
  PasswordInput,
  ColorInput,
} from "@mantine/core";

import { VisibilityToggleMuiIcon } from "@/components/ui/shared/VisibilityToggleMuiIcon";
import fonts from "@/components/ui/fonts";

import ColorizeIcon from '@mui/icons-material/Colorize';

const foremTheme = createTheme({
  fontFamily: fonts.roboto.style.fontFamily,
  headings: {
    fontFamily: fonts.roboto.style.fontFamily,
  },
  cursorType: "pointer",
  components: {
    ColorInput: ColorInput.extend({
      defaultProps: {
        eyeDropperIcon: <ColorizeIcon fontSize="small" />,
      }
    }),
    PasswordInput: PasswordInput.extend({
      defaultProps: {
        visibilityToggleIcon: VisibilityToggleMuiIcon,
      }
    }),
  },
});

export default foremTheme;