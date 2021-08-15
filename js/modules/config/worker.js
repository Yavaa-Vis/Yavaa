/**
 * worker related config file
 */
define({

  // time before an idle worker is killed
	workerTTL: 30 * 60 * 1000,

	// log messages to console
  //  log.LEVEL_DEBUG   = 1;
  //  log.LEVEL_INFO    = 2;
  //  log.LEVEL_WARNING = 4;
  //  log.LEVEL_ERROR   = 8;
  //  log.LEVEL_ALL     = 15;
	logLevel: 15,

	// log message traffic to file
	// only applies, if run in server mode
	logToFile: false,

	// where to place the log files
	logFolder: '/logs/',

});