/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Design System Token Colors
        primary: {
          DEFAULT: '#2563EB', // Electric Blue
          dark: '#1D4ED8',
          light: '#38BDF8',
        },
        navy: {
          DEFAULT: '#0F172A', // Deep Navy
          50: '#F0F6FF',
          100: '#E0EDFE',
          800: '#1E293B',
          900: '#0F172A',
        },
        electric: {
          500: '#3B82F6',
          600: '#2563EB', // Main interactive brand color
          700: '#1D4ED8',
        },
        sky: {
          400: '#38BDF8',
        },
        slate: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A',
        },
        brand: {
          navy: '#0F172A',
          blue: '#2563EB',
          sky: '#38BDF8',
          slate: '#F8FAFC',
          darkText: '#0F172A',
          secondaryText: '#64748B',
          mutedText: '#94A3B8',
          border: '#E2E8F0',
          success: '#16A34A',
          warning: '#F59E0B',
          error: '#DC2626',
        }
      },
      fontFamily: {
        display: ['Plus Jakarta Sans', 'Jones', 'sans-serif'],
        sans: ['DM Sans', 'Inter', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
      },
      spacing: {
        'space-1': '0px',
        'space-2': '2px',
        'space-3': '3px',
        'space-4': '4px',
        'space-5': '5px',
        'space-6': '6px',
        'space-7': '8px',
        'space-8': '10px',
        'space-9': '11px',
        'space-10': '12px',
        'space-11': '14px',
        'space-12': '16px',
        'space-13': '20px',
        'space-14': '24px',
        'space-15': '28px',
        'space-16': '30px',
        'space-17': '32px',
        'space-18': '40px',
        'space-19': '48px',
        'space-20': '56px',
        'space-21': '80px',
        'space-22': '96px',
      },
      borderRadius: {
        'px-4': '4px',
        'px-6': '6px',
        'px-8': '8px',
        'px-12': '12px',
        'px-16': '16px',
        'px-20': '20px',
        'px-24': '24px',
        'pill': '999px',
      }
    },
  },
  plugins: [],
}
