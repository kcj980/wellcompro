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
      colors: {
        'sky-150': '#e6f4fa', // bg-sky-100과 bg-sky-200 사이의 색상 코드
        'sky-250': '#cce8f4', // bg-sky-200과 bg-sky-300 사이의 색상 코드
        'sky-350': '#c0e7ff', // 기존 #b2ddef에서 더 맑고 밝은 하늘색으로 조정
        'sky-450': '#a3ddff', // 기존 #96d2ea에서 더 깨끗한 색감으로 조정
        'sky-550': '#83d3ff', // 기존 #76c7e4에서 더 밝고 선명한 느낌으로 조정
      },
    },
  },
  plugins: [],
} 