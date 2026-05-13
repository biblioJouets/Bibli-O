/** @type {import('tailwindcss').Config} */
module.exports = {
  corePlugins: {
    preflight: false,
  },
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'bj-text':   '#2E1D21',
        'bj-pink':   '#FF8C94',
        'bj-blue':   '#6EC1E4',
        'bj-green':  '#88D4AB',
        'bj-yellow': '#FFE264',
      },
    },
  },
  plugins: [],
}