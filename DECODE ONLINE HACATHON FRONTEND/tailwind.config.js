/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./src/app/globals.css"
  ],
  theme: {
    extend: {
      colors: {
        // Backgrounds - dark futuristic theme
        'background-primary': '#0a0a0a',
        'background-secondary': '#111111',
        'background-tertiary': '#1a1a1a',

        // Text
        'text-primary': '#ffffff',
        'text-secondary': '#e0e0e0',
        'text-muted': '#a0a0a0',

        // Borders
        'border': '#2a2a2a',
        'border-muted': '#3a3a3a',

        // Semantic colors for simulation states
        'success': '#10b981',
        'warning': '#f59e0b',
        'danger': '#ef4444',

        // Accent colors
        'accent-blue': '#3b82f6',
        'accent-purple': '#8b5cf6',
        'accent-pink': '#ec4899',

        // Primary color (for loading spinner, etc.)
        'primary': '#3b82f6', // same as accent-blue
      },
      borderColor: theme => theme('colors'),
      borderRadius: {
        xs: 'var(--radius-xs)',
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
        '2xl': 'var(--radius-2xl)',
        '3xl': 'var(--radius-3xl)',
      },
      boxShadow: {
        'sm': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        'md': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        'lg': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -2px rgb(0 0 0 / 0.1)',
        'xl': '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
        '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.15)',
        'glow': '0 0 15px 0 rgb(59 130 246 / 0.3)',
      },
      fontFamily: {
        sans: ['Geist', 'Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [
    require('tailwindcss-animate')
  ],
}