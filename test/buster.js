var config = module.exports;

config["dom-batch"] = {
  rootPath: '../',
  environment: "browser",
  sources: [
    'test/setup.js',
    'lib/dom-batch.js'
  ],
  tests: [
    'test/tests.js'
  ]
};
