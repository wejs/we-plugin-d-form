const projectPath = process.cwd(),
  deleteDir = require('rimraf'),
  testTools = require('we-test-tools'),
  path = require('path');

let we;

before(function(callback) {
  this.slow(100);

  testTools.copyLocalConfigIfNotExitst(projectPath, function() {
    const We = require('we-core');
    we = new We();

    testTools.init({}, we);

    we.bootstrap({
      i18n: {
        directory: path.join(__dirname, 'locales'),
        updateFiles: true
      }
    } , function(err, we) {
      if (err) throw err;

      we.startServer(function(err) {
        if (err) throw err;
        callback();
      });
    });
  });
});

//after all tests
after(function (callback) {
  let tempFolders = [
    projectPath + '/files/public/min',
    projectPath + '/config/local.js',
  ];

  we.utils.async.each(tempFolders, function(folder, next){
    deleteDir( folder, next);
  }, function(err) {
    if (err) throw new Error(err);
    callback();
  });
});

after(function () {
  we.exit(process.exit);
});