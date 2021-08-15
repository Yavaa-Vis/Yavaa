'use strict';
/**
 * purge a Yavaa logfile removing any non data related requests
 * job-IDs will be adjusted
 * 
 * might need to re-enable certain commands to debug some events
 * 
 * removes in particular:
 * - search requests
 * - data listings (getData)
 */

// includes
const Readline  = require( 'readline' ),
      Fs        = require( 'mz/fs' ),
      Path      = require( 'path' )
      ;

// configuration
const cfg = {

  // the logfile to replay
  log:    Path.join( __dirname, 'log', '2020-07-27T14-24-42-825Z_LZCxhSdmHeXmwPaoAfzR.log' ),

  // removed message types
  removed: new Set([
    'getColumnValues',
//    'getDsByCombination',
    'getDsDetails',
    'getData',
    'getMeta',
    'getWorkflow',
    'resolveColValues',
    'search',
    'suggestViz',
    'typeAhead',
    'vizSuggestions',
  ]),
  
};
// the purged file
cfg.output = getPurgedFilename( cfg.log ),

// do the purge
(async function(){

  // read stream
  const logfile = Readline.createInterface({
    input: Fs.createReadStream( cfg.log ),
  });
  
  // write stream
  const purgedfile = Fs.createWriteStream( cfg.output );
  
  // process each line
  let linesWritten = 0, linesPurged = 0, linesTotal = 0;
  const skippedJobs = new Set(), // jobIDs skipped
        iterator = logfile[ Symbol.asyncIterator ](), // explicit iterator for the logfile lines
        jobidMap = {}; // map between old and new jobIds
  let lastJobId = 0; // latest jobId used
  for await (const line of logfile ){

    // parse
    const entry = JSON.parse( line );
    linesTotal += 1;

    // we skip UI commands
    if( (entry.type == 'in') && cfg.removed.has( entry.msg.action ) ) {
      
      // get the respective 'queued' message; should be the next line
      const queueLine = await iterator.next();
      
      // last line might be empty
      if( queueLine.done || queueLine.value == '' ) {
        continue;
      }

      // parse the 'queued' entry
      const queueEntry = JSON.parse( queueLine.value );

      // add the job ID to the purged ones
      skippedJobs.add( queueEntry.msg._jobID );
      
      // skip it already
      linesPurged += 1;
      continue;
    }
    
    // also skip any entry using the skipped job-IDs
    if( ('_jobID' in entry.msg) && skippedJobs.has( entry.msg._jobID ) ) {
      linesPurged += 1;
      continue;
    }
    
    // surviving 'queued' messages give us a new jobID
    if( entry.msg.action == 'queued' ) {
      jobidMap[ entry.msg._jobID ] = ++lastJobId;
    }

    // adjust jobIds
    if( '_jobID' in entry.msg ) {
      entry.msg._jobID = jobidMap[ entry.msg._jobID ];
    }

    // if we got this far, this entry may survive
    await purgedfile.write( JSON.stringify( entry ) )
    await purgedfile.write( '\n' );
    linesWritten += 1;

  }
  
  // finish up
  logfile.close();
  purgedfile.end();
  console.log( `lines processed: ${linesTotal}` );
  console.log( `lines written: ${linesWritten}` );
  console.log( `lines purged: ${linesPurged}` );

})().catch( (e) => {
  console.error( e );
});

function getPurgedFilename( file ) {
  return file.replace( Path.extname( file ), '.purged' + Path.extname( file ) );
}
