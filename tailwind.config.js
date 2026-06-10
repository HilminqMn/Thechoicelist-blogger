/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Anuphan', 'sans-serif'],
      },
      colors: {
        brand: {
          bg: '#F8FAFC',
          text: '#0F172A',
          dark: '#020617',
          accent: '#EA580C',
        },
      },
    },
  },
  plugins: [],
};
