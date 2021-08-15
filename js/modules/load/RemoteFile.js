/**
 * Just a splitting between server and browser
 */
"use strict";
define( [ (requirejs.isBrowser || requirejs.isWorker) ? 'load/RemoteFile.browser' : 'load/RemoteFile.server' ], 
function( RemoteFile ){
  return RemoteFile;
});