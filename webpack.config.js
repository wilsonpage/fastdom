var webpack = require('webpack');

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
    },
    
    plugins: [
      new webpack.DefinePlugin({
        'process.env': {
          'NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
        }
      })
    ]
  }
];
