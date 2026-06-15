/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "24px",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        navy: {
          50: "#F0F4FA",
          100: "#D9E2F0",
          200: "#B5C7E0",
          300: "#85A2C8",
          400: "#4E73A8",
          500: "#0F2C59",
          600: "#0B2247",
          700: "#081935",
          800: "#06132A",
          900: "#040D1F",
        },
        teal: {
          50: "#ECFEFF",
          100: "#CFFAFE",
          200: "#A5F3FC",
          300: "#67E8F9",
          400: "#22D3EE",
          500: "#0891B2",
          600: "#0E7490",
          700: "#155E75",
        },
        drug: {
          normal: "#10B981",
          restricted: "#F59E0B",
          special: "#EF4444",
        },
        severity: {
          low: "#3B82F6",
          medium: "#F59E0B",
          high: "#F97316",
          critical: "#DC2626",
        },
        surface: {
          DEFAULT: "#FFFFFF",
          soft: "#FAFBFC",
          muted: "#F3F4F6",
        },
        border: {
          DEFAULT: "#E5E7EB",
          strong: "#D1D5DB",
          muted: "#F3F4F6",
        },
      },
      fontFamily: {
        serif: ['"Noto Serif SC"', "Georgia", "serif"],
        sans: ['"Inter"', "system-ui", "-apple-system", "sans-serif"],
        mono: ['"JetBrains Mono"', "ui-monospace", "monospace"],
      },
      fontSize: {
        "2xs": ["10px", { lineHeight: "14px", letterSpacing: "-0.01em" }],
        xs: ["12px", { lineHeight: "18px", letterSpacing: "-0.005em" }],
        sm: ["13px", { lineHeight: "20px", letterSpacing: "-0.005em" }],
        base: ["14px", { lineHeight: "22px", letterSpacing: "-0.01em" }],
        lg: ["15px", { lineHeight: "24px", letterSpacing: "-0.01em" }],
        xl: ["16px", { lineHeight: "26px", letterSpacing: "-0.01em" }],
        "2xl": ["20px", { lineHeight: "30px", letterSpacing: "-0.02em" }],
        "3xl": ["24px", { lineHeight: "34px", letterSpacing: "-0.02em" }],
        "4xl": ["30px", { lineHeight: "40px", letterSpacing: "-0.025em" }],
        "5xl": ["36px", { lineHeight: "46px", letterSpacing: "-0.025em" }],
        "6xl": ["48px", { lineHeight: "56px", letterSpacing: "-0.03em" }],
      },
      boxShadow: {
        card: "0 1px 2px 0 rgb(0 0 0 / 0.04), 0 1px 3px 0 rgb(0 0 0 / 0.06)",
        "card-hover":
          "0 4px 6px -1px rgb(0 0 0 / 0.08), 0 2px 4px -2px rgb(0 0 0 / 0.06)",
        dropdown:
          "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.06)",
        panel:
          "0 0 0 1px rgb(15 44 89 / 0.04), 0 8px 24px -4px rgb(15 44 89 / 0.08)",
      },
      borderRadius: {
        lg: "10px",
        xl: "12px",
        "2xl": "16px",
      },
      animation: {
        "fade-in-up": "fadeInUp 0.4s ease-out forwards",
        "fade-in": "fadeIn 0.3s ease-out forwards",
        "slide-in-right": "slideInRight 0.3s ease-out forwards",
        "pulse-critical": "pulseCritical 1.2s ease-in-out 3",
        "count-up": "countUp 0.8s ease-out forwards",
        shimmer: "shimmer 1.5s ease-in-out infinite",
      },
      keyframes: {
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideInRight: {
          "0%": { opacity: "0", transform: "translateX(16px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        pulseCritical: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.6" },
        },
        countUp: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-468px 0" },
          "100%": { backgroundPosition: "468px 0" },
        },
      },
      backgroundImage: {
        "gradient-navy":
          "linear-gradient(135deg, #0F2C59 0%, #1E3A5F 50%, #0891B2 100%)",
        "gradient-card-red":
          "linear-gradient(135deg, #FEE2E2 0%, #FECACA 40%, #FCA5A5 100%)",
        "gradient-card-orange":
          "linear-gradient(135deg, #FEF3C7 0%, #FDE68A 40%, #FCD34D 100%)",
        "gradient-card-teal":
          "linear-gradient(135deg, #CFFAFE 0%, #A5F3FC 40%, #67E8F9 100%)",
        "gradient-card-blue":
          "linear-gradient(135deg, #DBEAFE 0%, #BFDBFE 40%, #93C5FD 100%)",
        "gradient-card-purple":
          "linear-gradient(135deg, #F3E8FF 0%, #E9D5FF 40%, #D8B4FE 100%)",
        "grid-pattern":
          "linear-gradient(to right, rgba(15,44,89,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(15,44,89,0.03) 1px, transparent 1px)",
      },
      backgroundSize: {
        grid: "24px 24px",
      },
    },
  },
  plugins: [],
};
