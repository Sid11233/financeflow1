import type { Config } from 'tailwindcss';
import defaultTheme from 'tailwindcss/defaultTheme';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        accent: {
          DEFAULT: 'rgb(var(--color-accent) / <alpha-value>)',
          foreground: 'rgb(var(--color-accent-foreground) / <alpha-value>)',
        },
        // Warm-toned replacement for Tailwind's default true-gray neutral
        // scale, matching the Finly landing page's palette (cream 50,
        // cool charcoal 900) — see src/index.css for the two brand colors
        // this is built around.
        neutral: {
          50: '#F7F5F0',
          100: '#E8E7E3',
          200: '#D1CFCE',
          300: '#B6B5B6',
          400: '#818187',
          500: '#55565F',
          600: '#3F4149',
          700: '#32333C',
          800: '#262830',
          900: '#1C1E26',
        },
      },
      fontFamily: {
        sans: ['Inter', ...defaultTheme.fontFamily.sans],
        serif: ['Fraunces', ...defaultTheme.fontFamily.serif],
        mono: ['"IBM Plex Mono"', ...defaultTheme.fontFamily.mono],
      },
    },
  },
  plugins: [],
} satisfies Config;
