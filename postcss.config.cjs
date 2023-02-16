module.exports = {
  plugins: {
    'postcss-import': {},
    'tailwindcss': {},
    'autoprefixer': {},
    'postcss-advanced-variables': {},
    'postcss-map-get': {},
    'postcss-sort-media-queries': {},
    'postcss-assets': {loadPaths: ['src/img/']},
    'cssnano': {},
    'postcss-math': {}
  },
}
