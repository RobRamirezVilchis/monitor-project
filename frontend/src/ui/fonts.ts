import { Roboto_Flex, Ubuntu } from "next/font/google";

export const roboto = Roboto_Flex({
  weight: ["400", "500", "600", "700"],
  style: ["normal"],
  subsets: ["latin"],
  display: "swap",
  fallback: ["Helvetica", "sans-serif"],
});

export const ubuntu = Ubuntu({
  weight: ["400", "500", "700"],
  style: ["normal"],
  subsets: ["latin"],
  display: "swap",
  fallback: ["Helvetica", "sans-serif"],
});

const fonts = {
  roboto,
  ubuntu,
};

export default fonts;
