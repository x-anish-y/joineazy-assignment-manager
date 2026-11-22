/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        'bg-subtle': 'var(--bg-subtle)',
        surface: 'var(--surface)',
        'surface-hover': 'var(--surface-hover)',
        'surface-glass': 'var(--surface-glass)',
        border: 'var(--border)',
        'border-subtle': 'var(--border-subtle)',
        'border-focus': 'var(--border-focus)',
        text: 'var(--text)',
        'text-muted': 'var(--text-muted)',
        'text-inverse': 'var(--text-inverse)',
        primary: {
          DEFAULT: 'var(--primary)',
          hover: 'var(--primary-hover)',
          light: 'var(--primary-light)',
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
        },
        accent: 'var(--accent)',
        'accent-light': 'var(--accent-light)',
        success: {
          DEFAULT: 'var(--success)',
          light: 'var(--success-light)',
        },
        warning: {
          DEFAULT: 'var(--warning)',
          light: 'var(--warning-light)',
        },
        danger: {
          DEFAULT: 'var(--danger)',
          light: 'var(--danger-light)',
        },
        glow: 'var(--glow)',
      },
    },
  },
  plugins: [],
};
