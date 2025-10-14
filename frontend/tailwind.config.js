/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
theme: {
  extend: {
    colors: {
      primary: '#4E9EFF',
      secondary: '#7BDFF2',
      accent: '#FFC857',
      success: '#10B981',
      danger: '#EF4444',
      info: '#94A3B8',
    },
  },
}
,
  plugins: [],
};
