module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
    "postcss-preset-mantine": {},
    "postcss-simple-vars": {
      variables: {
        "mantine-breakpoint-xs": "640px",
        "mantine-breakpoint-sm": "768px",
        "mantine-breakpoint-md": "1024px",
        "mantine-breakpoint-lg": "1280px",
        "mantine-breakpoint-xl": "1536px",
      },
    },
  },
}
