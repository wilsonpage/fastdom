'use strict';

module.exports = function(config) {
  config.set({
    basePath: '..',

    browsers: [
      'chrome',
      'Firefox'
    ],

    frameworks: [
      'mocha',
      'chai-sinon'
    ],

    reporters: [
      'mocha',
      'coverage'
    ],

    coverageReporter: {
       type : 'lcov',
       dir : 'test/',
       subdir: 'coverage'
     },

    preprocessors: {
      'fastdom.js': ['coverage'],
      'extensions/*.js': ['coverage']
    },

    client: {
      captureConsole: true,
      mocha: { ui: 'tdd' }
    },

    customLaunchers: {
      chrome: {
        base: 'Chrome',
        flags: ['--no-sandbox']
      }
    },

    files: [
      'fastdom.js',
      'extensions/fastdom-promised.js',
      'extensions/fastdom-sandbox.js',
      'test/fastdom-sandbox-test.js',
      'test/fastdom-promised-test.js',
      'test/fastdom-strict-test.js',
      'test/fastdom-test.js',
      { pattern: 'fastdom-strict.js', included: false }
    ]
  });
};
