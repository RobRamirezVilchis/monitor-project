/** @type {import("tailwindcss").Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    screens: {
      "sm": "640px",
      // => @media (min-width: 640px) { ... }
      "md": "768px",
      // => @media (min-width: 768px) { ... }
      "lg": "1024px",
      // => @media (min-width: 1024px) { ... }
      "xl": "1280px",
      // => @media (min-width: 1280px) { ... }
      "2xl": "1536px",
      // => @media (min-width: 1536px) { ... }
    },
    extend: {
      colors: {
        current: "currentColor",
        dark: {
          50 : "#ffffff", // "#C1C2C5",
          100: "#9CA3AF", // "#A6A7AB",
          200: "#909296",
          300: "#5C5F66",
          400: "#373A40",
          500: "#2C2E33",
          600: "#222222", // "#25262B",
          700: "#171717", // "#1A1B1E",
          800: "#0F0F0F", // "#141517",
          900: "#000000", // "#101113",
        },
        lush: {
          50:  "var(--mantine-color-lush-0)",
          100: "var(--mantine-color-lush-1)",
          200: "var(--mantine-color-lush-2)",
          300: "var(--mantine-color-lush-3)",
          400: "var(--mantine-color-lush-4)",
          500: "var(--mantine-color-lush-5)",
          600: "var(--mantine-color-lush-6)",
          700: "var(--mantine-color-lush-7)",
          800: "var(--mantine-color-lush-8)",
          900: "var(--mantine-color-lush-9)",
        },
        // forem: {
        //   green: {
        //     50 : "var(--forem-green-50)",
        //     100: "var(--forem-green-100)",
        //     200: "var(--forem-green-200)",
        //     300: "var(--forem-green-300)",
        //     400: "var(--forem-green-400)",
        //     500: "var(--forem-green-500)",
        //     600: "var(--forem-green-600)",
        //     700: "var(--forem-green-700)",
        //     800: "var(--forem-green-800)",
        //     900: "var(--forem-green-900)",
        //   },
        // },
      },
    },
  },
  plugins: [],
}
