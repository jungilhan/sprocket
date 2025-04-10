/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{svelte,ts}",
    "./node_modules/daisyui/**/*.js",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Sora"', "sans-serif"],
      },
    },
  },
  plugins: [require("daisyui")],
};
