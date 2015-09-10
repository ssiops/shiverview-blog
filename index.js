function App() {
  var manifest = require('./manifest.json');
  for (var prop in manifest) {
    this[prop] = manifest[prop];
  }
  this.routes = require('./routes.js');
  this.pkg = require('./package.json');
  this.bower = require('./bower.json');
  this.tests = require('./tests/index.js');
  return this;
}

var app = new App();

App.prototype.init = function (srv, callback) {
  if (process.env.verbose) console.log('Checking archive and label indexes.');
  srv.db.index([
    {
      coll: 'archive',
      index: 'title',
      options: {unique: true}
    },
    {
      coll: 'labels',
      index: 'title',
      options: {unique: true}
    }
  ]).then(function () {
    callback();
  }, function (err) {
    callback(err);
  });
};

module.exports = app;
