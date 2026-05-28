import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-noto-sans-kr)", "system-ui", "sans-serif"],
        serif: ["var(--font-noto-serif-kr)", "Georgia", "serif"],
        garamond: ["EB Garamond", "Georgia", "serif"],
      },
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted-hsl))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent-hsl))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        /* Design Tokens as Tailwind colors */
        "q-bg": "#F4EFE5",
        "q-bg-soft": "#ECE5D7",
        "q-bg-warm": "#E5DCC9",
        "q-bg-ink": "#14181F",
        "q-bg-navy": "#1B2536",
        "q-ink": "#1C1F26",
        "q-ink-soft": "#2A2E37",
        "q-muted": "#7B7268",
        "q-muted-2": "#A39A8C",
        "q-line": "#D9CFBC",
        "q-line-soft": "#E5DDCB",
        "q-accent": "#5E4632",
        "q-gold": "#B08A4A",
        "q-cream": "#ECE3CF",
        warm: {
          50: "#FAFAF8",
          100: "#F5F3EF",
          200: "#EDE9E2",
          300: "#DDD8CE",
          400: "#C5BEB0",
          500: "#A89F90",
          600: "#8A8070",
          700: "#6B6358",
          800: "#4A4440",
          900: "#2D2926",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        "2xl": "1rem",
        "3xl": "1.5rem",
        "4xl": "2rem",
      },
      boxShadow: {
        "card-sm": "0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.03)",
        card: "0 4px 16px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.04)",
        "card-lg": "0 8px 32px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04)",
        "card-hover": "0 12px 40px rgba(0,0,0,0.10), 0 4px 12px rgba(0,0,0,0.06)",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out",
        "slide-up": "slideUp 0.4s ease-out",
        "scale-in": "scaleIn 0.3s ease-out",
        "mark-breathe": "markBreathe 3.8s ease-in-out infinite",
        "mark-bob": "markBob 2.6s ease-in-out infinite",
        "floaty": "floaty 14s ease-in-out infinite",
        "slide-down": "slideDown 2s ease-in-out infinite",
        "pulse-expand": "pulseExpand 2.4s ease-out infinite",
        "blink": "blink 2s ease-in-out infinite",
        "breathe-glow": "breatheGlow 3.6s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.97)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        markBreathe: {
          "0%, 100%": { transform: "scale(1) rotate(-5deg)" },
          "50%": { transform: "scale(1.12) rotate(5deg)" },
        },
        markBob: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-5px)" },
        },
        floaty: {
          "0%, 100%": { transform: "translateY(0) rotate(0deg)", opacity: "0.6" },
          "25%": { transform: "translateY(-18px) rotate(3deg)", opacity: "0.8" },
          "50%": { transform: "translateY(-8px) rotate(-2deg)", opacity: "0.5" },
          "75%": { transform: "translateY(-24px) rotate(4deg)", opacity: "0.7" },
        },
        slideDown: {
          "0%, 100%": { transform: "translateY(0)", opacity: "0.6" },
          "50%": { transform: "translateY(8px)", opacity: "1" },
        },
        pulseExpand: {
          "0%": { transform: "scale(1)", opacity: "0.8" },
          "70%": { transform: "scale(2.4)", opacity: "0" },
          "100%": { transform: "scale(2.4)", opacity: "0" },
        },
        blink: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.3" },
        },
        breatheGlow: {
          "0%, 100%": {
            boxShadow: "0 0 16px rgba(28,31,38,0.25), 0 0 32px rgba(28,31,38,0.1)",
          },
          "50%": {
            boxShadow: "0 0 32px rgba(28,31,38,0.45), 0 0 64px rgba(28,31,38,0.2)",
          },
        },
      },
    },
  },
  plugins: [],
};

export default config;
