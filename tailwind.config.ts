import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./hooks/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        parchment: {
          50: "#fdf8ec",
          100: "#f5e9c8",
          200: "#e9d29a",
          300: "#d8b56a",
          400: "#bf8e3f",
          500: "#a06c2a",
          600: "#7d4f1e",
          700: "#5a3814",
          800: "#3b250d",
          900: "#241608",
        },
        prairie: {
          green: "#5a7f3a",
          sky: "#7ea7c5",
          dust: "#c2a26b",
          ink: "#1a1208",
        },
      },
      fontFamily: {
        pixel: ["var(--font-pixel)", "monospace"],
        body: ["var(--font-body)", "ui-serif", "Georgia", "serif"],
      },
      boxShadow: {
        woodcut: "0 0 0 2px #3b250d, 4px 4px 0 0 #3b250d",
      },
    },
  },
  plugins: [],
};

export default config;
