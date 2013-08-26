module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    buster: {
      foo: {}
    },
  });

  grunt.loadNpmTasks('grunt-buster');

  // Default task.
  grunt.registerTask('default', ['buster']);
};
