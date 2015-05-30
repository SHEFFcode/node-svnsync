/**
 * Dependencies
 */
var svnclient = require('./svn'),
  getcreds = require('./getcreds'),
  fs = require('fs'),
  rimraf = require('rimraf');

/**
 * Synchronizes a remove svn repo
 * @constructor
 */
var SVNSync = function (obj, cb) {

  if (!obj.dest) {
    throw new Error("Destination (dest) folder is required.");
  }

  if (!obj.localfolder) {
    throw new Error("Local folder name (localfolder) is required.");
  }

  if (!obj.repo) {
    throw new Error("Remote repository (repo) is required.");
  }

  // Make sure there is a callback
  cb = cb || function () {
      console.log("SVN Sync finished.");
    };

  /**
   * Runs the actual sync
   * @param username
   * @param password
   */
  function runsync(username, password) {
    var fullqualifiedplace = obj.dest + '/' + obj.localfolder;
    if (fs.existsSync(fullqualifiedplace)) {
      // Exit.. we already have the tag
      cb();
    } else {
      // Make the tag folder if it doesn't exist
      if (!fs.existsSync(obj.dest)) {
        fs.mkdir(obj.dest);
      }
      var ctx = this;

      console.info("Wait a moment, pulling repo " + obj.repo + "...");

      var client = new svnclient({
        cwd: obj.dest,
        username: username,
        password: password
      });
      client.checkout([obj.repo, '--quiet', '--non-interactive'], function (err, data) {

        if (err) {
          rimraf(obj.dest + '/' + obj.localfolder, function () {
            console.info('Could not connect to repository. Check your credentials and VPN settings.');
            cb(err);
          });
        } else {
          cb();
        }
      });

    }
  }
  var fullqualifiedplace = obj.dest + '/' + obj.localfolder;
  if (fs.existsSync(fullqualifiedplace)) {
    // Exit.. we already have the tag
    cb();
  } else {
    if (!obj.username || !obj.password) {
      // Get the credentials from the user
      getcreds(obj.repo, runsync)
    } else {
      runsync(obj.username, obj.password);
    }
  }

};

/**
 * Expose the class to the world
 * @type {Function}
 */
module.exports = SVNSync;
