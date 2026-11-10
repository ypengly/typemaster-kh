import type { Config } from "tailwindcss";

const token = (name: string) => `hsl(var(--${name}) / <alpha-value>)`;

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: token("background"),
        foreground: token("foreground"),
        card: token("card"),
        muted: token("muted"),
        "muted-foreground": token("muted-foreground"),
        border: token("border"),
        primary: token("primary"),
        "primary-foreground": token("primary-foreground"),
        accent: token("accent"),
        "accent-foreground": token("accent-foreground"),
        success: token("success"),
        danger: token("danger"),
        ring: token("ring"),
      },
      fontFamily: {
        sans: ["var(--font-body)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "var(--font-body)", "system-ui", "sans-serif"],
        khmer: ["var(--font-khmer)", "Khmer OS", "Leelawadee UI", "Khmer UI", "Noto Sans Khmer", "sans-serif"],
      },
      borderRadius: { xl: "1rem", "2xl": "1.375rem" },
      boxShadow: {
        soft: "0 1px 2px hsl(var(--shadow) / 0.06), 0 8px 24px -12px hsl(var(--shadow) / 0.18)",
      },
      keyframes: {
        pop: { "0%": { transform: "scale(.96)", opacity: "0" }, "100%": { transform: "scale(1)", opacity: "1" } },
        blink: { "0%,100%": { opacity: "1" }, "50%": { opacity: "0.25" } },
      },
      animation: { pop: "pop .22s ease-out", blink: "blink 1.1s ease-in-out infinite" },
    },
  },
  plugins: [],
};
export default config;
