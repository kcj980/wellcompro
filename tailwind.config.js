/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      padding: {
        '4.5': '1.125rem', // 18px에 해당하는 값 추가
        '2.5': '0.625rem', // 18px에 해당하는 값 추가
      },
    },
  },
  plugins: [],
} 