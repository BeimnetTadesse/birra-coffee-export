import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        pine: {
          950: "#070f0a",
          900: "#0b1e14",
          800: "#0e1d14",
          700: "#0e3d24",
          600: "#164a2b",
          500: "#1f5c36",
        },
        cream: {
          50: "#fbf8f1",
          100: "#f7f2e6",
          200: "#ece3cf",
          300: "#d9cdae",
        },
        ink: {
          700: "#1a2b20",
          500: "#3d4d42",
          400: "#5b6a5f",
        },
        gold: {
          300: "#f3c66b",
          400: "#efa924",
          500: "#e0940f",
          600: "#b8760c",
        },
      },
      fontFamily: {
        display: ["var(--font-display)"],
        sans: ["var(--font-body)"],
        mono: ["var(--font-mono)"],
        arabic: ["var(--font-arabic)"],
      },
      backgroundImage: {
        "partner-glow":
          "radial-gradient(80% 100% at 15% 0%, #3a2a0f 0%, #0e1d14 45%, #070f0a 100%)",
        "gold-fade": "linear-gradient(90deg, transparent, #efa924, transparent)",
      },
      animation: {
        "fade-up": "fadeUp 0.8s ease forwards",
        "bounce-slow": "bounceSlow 2.2s ease-in-out infinite",
        marquee: "marquee 28s linear infinite",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        bounceSlow: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(10px)" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
