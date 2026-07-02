import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: "#F7F8FA",
        surface: "#FFFFFF",
        ink: "#0C1422",
        muted: "#5B6675",
        line: "#E6E9EE",
        brand: { DEFAULT: "#0E2A47", 600: "#13355A", 400: "#2B5F95", 50: "#EEF3F9" },
        accent: { DEFAULT: "#E4002B", 600: "#C30025", 50: "#FFEDF0" },
      },
      fontFamily: {
        display: ["var(--font-space)", "sans-serif"],
        sans: ["var(--font-inter)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      fontWeight: { normal: "400", medium: "500", semibold: "600", bold: "700" },
      boxShadow: {
        card: "0 1px 2px rgba(12,20,34,.04), 0 8px 24px rgba(12,20,34,.06)",
        lift: "0 12px 40px rgba(12,20,34,.12)",
      },
      borderRadius: { xl2: "1.25rem" },
    },
  },
  plugins: [],
};

export default config;
