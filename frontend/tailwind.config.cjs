module.exports = {
  content: ['./index.html','./src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ui: {
          bg: '#111111',
          surface: '#1A1A1C',
          border: 'rgba(255,255,255,0.06)',
          text: '#E6E6E6',
          subtle: '#9B9B9B',
        },
        accent: '#D97C3F',
      },
      borderRadius: {
        xl: '14px',
      }
    }
  },
  plugins:[require('@tailwindcss/forms'), require('@tailwindcss/typography')],
}
