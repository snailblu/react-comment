/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"], // Enable dark mode using class strategy
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}", // Assuming shadcn components will be here
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}", // Keep existing src path
  ],
  prefix: "", // No prefix for utility classes
  theme: {
    container: {
      // Container settings
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    fontSize: {
      // fontSize 설정 추가 (extend 밖)
      xs: ["1rem", "1.5rem"], // 12px -> 16px
      sm: ["1rem", "1.5rem"], // 14px -> 16px
      base: ["1rem", "1.5rem"], // 16px (유지)
      lg: ["1rem", "1.5rem"], // 18px -> 16px
      xl: ["1rem", "1.5rem"], // 20px -> 16px
      "2xl": ["2rem", "2.5rem"], // 24px -> 32px
      "3xl": ["2rem", "2.5rem"], // 30px -> 32px
      "4xl": ["2rem", "2.5rem"], // 36px -> 32px
      "5xl": ["3rem", "1"], // 48px (유지)
      "6xl": ["4rem", "1"], // 60px -> 64px
      "7xl": ["4rem", "1"], // 72px -> 64px
      "8xl": ["6rem", "1"], // 96px (유지)
      "9xl": ["8rem", "1"], // 128px (유지)
    },
    extend: {
      // Extend the default theme
      colors: {
        // Define custom colors (using CSS variables for theming)
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        // Define border radius values
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        // Define keyframes for animations
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        // Define animations using the keyframes
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      // Add Playfair Display and NeoDunggeunmoPro font families
      fontFamily: {
        playfair: ['"Playfair Display"', "serif"], // Use quotes for multi-word font names
        neodgm: ['"NeoDunggeunmoPro"', "sans-serif"], // Add NeoDunggeunmoPro
      },
    },
  },
  plugins: [require("tailwindcss-animate")], // Add the animate plugin
};
