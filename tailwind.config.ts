import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        math:    { DEFAULT: "#3b82f6", light: "#dbeafe" },
        science: { DEFAULT: "#22c55e", light: "#dcfce7" },
        english: { DEFAULT: "#f97316", light: "#ffedd5" },
        history: { DEFAULT: "#a855f7", light: "#f3e8ff" },
      },
    },
  },
  plugins: [],
};
export default config;
