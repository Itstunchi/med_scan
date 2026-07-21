/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        teal: {
          50: '#f0fdfa', 100: '#ccfbf1', 200: '#99f6e4', 300: '#5eead4',
          400: '#2dd4bf', 500: '#14b8a6', 600: '#0d9488', 700: '#0f766e',
          800: '#115e59', 900: '#134e4a', 950: '#042f2e',
        },
        coral: {
          50: '#fff1f0', 100: '#ffe0dd', 200: '#ffc1ba', 300: '#ff9b8e',
          400: '#ff6f5c', 500: '#ff4d38', 600: '#f02e16', 700: '#c2240f',
          800: '#9d2010', 900: '#7f1d10',
        },
        success: { 50: '#f0fdf4', 100: '#dcfce7', 500: '#22c55e', 600: '#16a34a', 700: '#15803d' },
        warning: { 50: '#fffbeb', 100: '#fef3c7', 500: '#f59e0b', 600: '#d97706', 700: '#b45309' },
        error: { 50: '#fef2f2', 100: '#fee2e2', 500: '#ef4444', 600: '#dc2626', 700: '#b91c1c' },
      },
      backgroundImage: {
        'teal-gradient': 'linear-gradient(135deg, #0f766e 0%, #14b8a6 100%)',
        'card-gradient': 'linear-gradient(135deg, #ffffff 0%, #f0fdfa 100%)',
        'slate-gradient': 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
        'coral-gradient': 'linear-gradient(135deg, #f02e16 0%, #ff6f5c 100%)',
        'emerald-gradient': 'linear-gradient(135deg, #047857 0%, #10b981 100%)',
        'amber-gradient': 'linear-gradient(135deg, #b45309 0%, #f59e0b 100%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'slide-right': 'slideRight 0.4s ease-out',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { transform: 'translateY(20px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
        slideRight: { '0%': { transform: 'translateX(-20px)', opacity: '0' }, '100%': { transform: 'translateX(0)', opacity: '1' } },
        float: { '0%, 100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-10px)' } },
      },
      boxShadow: {
        'card': '0 2px 8px -2px rgba(0,0,0,0.08), 0 1px 3px -1px rgba(0,0,0,0.06)',
        'card-hover': '0 12px 24px -6px rgba(0,0,0,0.12), 0 4px 8px -2px rgba(0,0,0,0.08)',
        'teal': '0 4px 14px -2px rgba(13,148,136,0.35)',
      },
    },
  },
  plugins: [],
}
