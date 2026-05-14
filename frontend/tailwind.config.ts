import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  // Light-only app — no dark mode. `class` strategy means a stray `dark:`
  // utility never activates (the `.dark` class is never added).
  darkMode: ["class"],
  theme: {
    extend: {
      colors: {
        // Primary — electric violet
        primary: {
          50: "#F1EAFE",
          100: "#D7C0FB",
          400: "#A06BFF",
          600: "#7C2DFF",
          900: "#3B0A99",
        },
        // Secondary — vivid teal
        secondary: {
          50: "#D9FBF0",
          400: "#2EE6B6",
          600: "#00CC9A",
          800: "#067A5C",
        },
        // Neutral (Warm Gray) — surfaces, structure, body text
        neutral: {
          50: "#F1EFE8",
          100: "#D3D1C7",
          400: "#888780",
          900: "#2C2C2A",
        },
        // Accent — vivid amber / orange
        accent: {
          50: "#FFEFD1",
          400: "#FFAA14",
          600: "#E07000",
          900: "#8A4A00",
        },
        // Magenta — hot pink; pairs with violet for vibrant gradients
        magenta: {
          50: "#FCE4F3",
          400: "#FF5CC8",
          600: "#E0148C",
          900: "#7A0A4A",
        },
      },
      fontFamily: {
        sans: ["var(--font-dm-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        serif: ["var(--font-lora)", "ui-serif", "Georgia", "serif"],
      },
      keyframes: {
        scan: {
          "0%, 100%": { transform: "translateY(-130%)" },
          "50%": { transform: "translateY(130%)" },
        },
      },
      animation: {
        scan: "scan 1.6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
