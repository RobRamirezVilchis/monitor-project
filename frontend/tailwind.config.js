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
    extend: {
      colors: {
        current: "currentColor",
        dark: {
          50 : "#C1C2C5",
          100: "#A6A7AB",
          200: "#909296",
          300: "#5C5F66",
          400: "#373A40",
          500: "#2C2E33",
          600: "#25262B",
          700: "#1A1B1E",
          800: "#141517",
          900: "#101113",
        },
      },
    },
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
    }
  },
  plugins: [],
}
