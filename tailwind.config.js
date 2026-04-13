/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'bg-primary': '#faf8f3',
        'bg-secondary': '#f5f1eb',
        'bg-dark': '#1a1a1a',
        'bg-card': '#ffffff',
        'bg-card-hover': '#fdfbf8',
        'border-light': '#e8e3dc',
        'border-accent': '#d4ccc4',
        'accent-blue': '#2563eb',
        'accent-blue-light': '#3b82f6',
        'accent-blue-dark': '#1e40af',
        'accent-white': '#ffffff',
        'text-dark': '#1a1a1a',
        'text-secondary': '#6b7280',
        'text-muted': '#9ca3af',
        'success-green': '#10b981',
        'warning-amber': '#f59e0b',
        'danger-red': '#ef4444',
      },
      fontFamily: {
        heading: ['"Plus Jakarta Sans"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'soft': '0 2px 8px rgba(0,0,0,0.06)',
        'medium': '0 4px 16px rgba(0,0,0,0.08)',
        'lg': '0 8px 24px rgba(0,0,0,0.1)',
        'blue-glow': '0 0 20px rgba(37, 99, 235, 0.15)',
        'blue-glow-sm': '0 0 12px rgba(37, 99, 235, 0.1)',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-in-right': 'slideInRight 0.4s ease-out',
        'bounce-light': 'bounceLight 3s ease-in-out infinite',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideUp: {
          from: { transform: 'translateY(16px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
        slideInRight: {
          from: { transform: 'translateX(24px)', opacity: '0' },
          to: { transform: 'translateX(0)', opacity: '1' },
        },
        bounceLight: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
    },
  },
  plugins: [],
};
