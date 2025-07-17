/** @type {import('tailwindcss').Config} */
module.exports = {
  // این خط برای فعال‌سازی دارک مود از طریق کلاس حیاتی است
  darkMode: 'class',

  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary Colors
        'primary': '#2563EB', // Trustworthy blue - blue-600
        'primary-50': '#EFF6FF', // Light blue tint - blue-50
        'primary-100': '#DBEAFE', // Lighter blue - blue-100
        'primary-500': '#3B82F6', // Medium blue - blue-500
        'primary-700': '#1D4ED8', // Darker blue - blue-700
        'primary-900': '#1E3A8A', // Darkest blue - blue-900
        
        // Secondary Colors
        'secondary': '#64748B', // Sophisticated slate - slate-500
        'secondary-50': '#F8FAFC', // Light slate - slate-50
        'secondary-100': '#F1F5F9', // Lighter slate - slate-100
        'secondary-200': '#E2E8F0', // Light slate - slate-200
        'secondary-300': '#CBD5E1', // Medium light slate - slate-300
        'secondary-400': '#94A3B8', // Medium slate - slate-400
        'secondary-600': '#475569', // Darker slate - slate-600
        'secondary-700': '#334155', // Dark slate - slate-700
        'secondary-800': '#1E293B', // Darker slate - slate-800
        'secondary-900': '#0F172A', // Darkest slate - slate-900
        
        // Accent Colors
        'accent': '#10B981', // Success-oriented emerald - emerald-500
        'accent-50': '#ECFDF5', // Light emerald - emerald-50
        'accent-100': '#D1FAE5', // Lighter emerald - emerald-100
        'accent-600': '#059669', // Darker emerald - emerald-600
        'accent-700': '#047857', // Dark emerald - emerald-700
        
        // Dynamic Colors using CSS Variables
        'background': 'var(--color-background)',
        'surface': 'var(--color-surface)',
        'surface-hover': 'var(--color-surface-hover)',
        'text-primary': 'var(--color-text-primary)',
        'text-secondary': 'var(--color-text-secondary)',
        'text-tertiary': 'var(--color-text-tertiary)',
        'text-inverse': 'var(--color-text-inverse)',
        'border': 'var(--color-border)',
        'border-light': 'var(--color-border-light)',
        'border-focus': 'var(--color-border-focus)',
        
        // Static Status Colors
        'success': '#059669',
        'success-light': '#D1FAE5',
        'warning': '#D97706',
        'warning-light': '#FEF3C7',
        'error': '#DC2626',
        'error-light': '#FEE2E2',
      },
      fontFamily: {
         'sans': ['Estedad', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'sans-serif'],
         'mono': ['JetBrains Mono', 'Fira Code', 'Monaco', 'Cascadia Code', 'Roboto Mono', 'monospace'],
      },
      
      // ✅ تنظیمات پلاگین typography
      typography: (theme) => ({
        DEFAULT: {
          css: {
            // فونت اصلی متن، همون فونت sans ما باشه
            fontFamily: theme('fontFamily.sans').join(', '),
            // ✅ وزن فونت رو کمی سنگین‌تر می‌کنیم تا خواناتر و پررنگ‌تر باشه
            fontWeight: '600',
          },
        },
      }),

      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      boxShadow: {
        'sm': 'var(--shadow-sm)',
        'md': 'var(--shadow-md)',
        'lg': 'var(--shadow-lg)',
        'hover': 'var(--shadow-hover)',
        'active': 'var(--shadow-active)',
      },
      borderRadius: {
        'sm': '0.25rem',
        'md': '0.375rem',
        'lg': '0.5rem',
        'xl': '0.75rem',
      },
      transitionDuration: {
        '150': '150ms',
        '200': '200ms',
        '300': '300ms',
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      zIndex: {
        '100': '100',
        '150': '150',
        '200': '200',
      },
      animation: {
        'pulse-subtle': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 200ms ease-out',
        'slide-in': 'slideIn 300ms ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
      },
    },
  },
  // ✅ پلاگین typography اینجا اضافه شد
  plugins: [
    require('tailwind-scrollbar'),
    require('@tailwindcss/typography'),
  ],
}
