import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#FFF1EC",
          100: "#FFDDCF",
          400: "#FF7A4D",
          500: "#FF5623",
          600: "#E8481A",
          700: "#C93B14",
        },
        ink: {
          900: "#1A1A1A",
          700: "#3F3F46",
          500: "#71717A",
          300: "#D4D4D8",
          100: "#F4F4F5",
        },
        good: { bg: "#DCFCE7", text: "#16A34A" },
        bad: { bg: "#FEE2E2", text: "#DC2626" },
        mid: { bg: "#FEF3C7", text: "#B45309" },
      },
      borderRadius: { xl2: "1.25rem" },
      fontFamily: {
        sans: ["var(--font-display)", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(16,16,16,0.04), 0 4px 16px rgba(16,16,16,0.04)",
      },
    },
  },
  plugins: [],
};
export default config;
