module.exports = [
  {
    entry: './src/fastdom-strict.js',
    output: {
      filename: 'fastdom-strict.js',
      library: 'fastdom',
      libraryTarget: 'umd'
    },

    externals: {
      '../fastdom': 'fastdom'
    }
  }
];
