import { Roboto_Flex } from "next/font/google";

export const roboto = Roboto_Flex({
  weight: ["400", "500", "600", "700"],
  style: ["normal"],
  subsets: ["latin"],
  display: "swap",
  fallback: ["Helvetica", "sans-serif"],
});

const fonts = {
  roboto,
};

export default fonts;
