var config = module.exports;

config["dom-batch"] = {
  rootPath: '../',
  environment: "browser",
  sources: [
    'lib/dom-batch.js',
    'test/setup.js'
  ],
  tests: [
    'test/test-*.js'
  ]
};
