// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  // >>> Source de vérité du mode sombre pour Tailwind
  darkMode: "class",
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};

export default config;