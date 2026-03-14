import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./hooks/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
    "./store/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        background: "rgb(var(--background) / <alpha-value>)",
        surface: "rgb(var(--surface) / <alpha-value>)",
        foreground: "rgb(var(--foreground) / <alpha-value>)",
        muted: "rgb(var(--muted) / <alpha-value>)",
        border: "rgb(var(--border) / <alpha-value>)",
        accent: "rgb(var(--accent) / <alpha-value>)",
        amber: "rgb(var(--amber) / <alpha-value>)",
        emerald: "rgb(var(--emerald) / <alpha-value>)",
        danger: "rgb(var(--danger) / <alpha-value>)"
      },
      fontFamily: {
        sans: ["var(--font-body)", "sans-serif"],
        display: ["var(--font-display)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"]
      },
      boxShadow: {
        glass: "0 22px 60px rgba(3, 8, 24, 0.45)",
        glow: "0 0 0 1px rgba(99, 102, 241, 0.2), 0 18px 55px rgba(79, 70, 229, 0.22)"
      },
      backgroundImage: {
        "grid-texture": "linear-gradient(to right, rgba(148, 163, 184, 0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(148, 163, 184, 0.06) 1px, transparent 1px)"
      },
      keyframes: {
        "border-pulse": {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(245, 158, 11, 0.28)" },
          "50%": { boxShadow: "0 0 0 6px rgba(245, 158, 11, 0)" }
        }
      },
      animation: {
        "border-pulse": "border-pulse 1.8s ease-in-out infinite"
      }
    }
  },
  plugins: []
};

export default config;
