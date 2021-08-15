"use strict";
/**
 * define a job queue for the computation engine
 */
define( [ 'basic/protocol_server.in', 'workflow/createEntry', 'basic/error', 'util/requirePromise' ],
function(      Commands             ,      createWFEntry,         error    ,  requireP ){

  function Queue( done, fail, progress ) {

    // process queue
    this._queue = [];

    // job id
    this._lastJobID = 0;

    // result callbacks
    this._progressCB = progress;
    this._doneCB = done;
    this._failCB = fail;

    // execution timer
    this._timer = null;

    // current job
    this._currentJob = null;
  }


  /**
   * Progress Handler
   * augment data with current job id and relay it to callback
   */
  Queue.prototype._progressHandler = function( data ) {
    data['_jobID'] = this._currentJob['id'];
    this._progressCB( data, `${this._currentJob['m']}.${this._currentJob['c']}` );
  };


  /**
   * Done Handler
   * augment data with current job id and relay it to callback
   * afterwards trigger next job execution
   */
  Queue.prototype._doneHandler = function( data ) {

    // add workflow entry
    createWFEntry( this._currentJob, data );

    // finish up last job
    data['_jobID'] = this._currentJob['id'];
    this._doneCB( data, `${this._currentJob['m']}.${this._currentJob['c']}` );

    // clear current job variables
    this._currentJob = null;

    // trigger execution of further jobs
    if( !this._timer ) {
      this._timer = setTimeout( this._executeJob.bind( this ), 0 );
    }

  };


  /**
   * Fail Handler
   * augment data with current job id and relay it to callback
   * afterwards trigger next job execution
   */
  Queue.prototype._failHandler = function( data ) {

    // make sure, we got something serializable
    // will return the same object, if already an ErrorWrapper
    const err = error( 'global', data );

    // add job id to error
    err.setJobID( this._currentJob['id'] );

    // finish up last job
    this._failCB( err, 'store/job' );

    // clear current job variables
    this._currentJob = null;

    // trigger execution of further jobs
    if( !this._timer ) {
      this._timer = setTimeout( this._executeJob.bind( this ), 0 );
    }

  };


  /**
   * add a job to this queue
   * @returns {Number} the jobID assigned to this job
   */
  Queue.prototype['addJob'] = function ( module, command, param, action ) {

    // command just given by message
    if( typeof command == 'undefined' ) {

      // get data
      const msg = module,
            cmd = Commands[ msg['action'] ];

      // convert format
      module  = cmd['binding']['module'];
      command = cmd['binding']['method'];
      param   = msg['params'];
      action  = msg['action'];

    }

    // increment job ID
    this._lastJobID += 1;

    // add to queue
    this._queue.push({
      'id': this._lastJobID,
      'm': module,
      'c': command,
      'p': param,
      'a': action
    });

    // trigger execution
    if( !this._timer ) {
      this._timer = setTimeout( this._executeJob.bind( this ), 0 );
    }

    // return job id
    return this._lastJobID;
  };


  /**
   * execute a job from job queue
   */
  Queue.prototype['_executeJob'] = async function (){

    // reenable timer
    this._timer = null;

    // check, if there is still work to do
    if( this._queue.length < 1 ) {
      return;
    }

    // check, if there is another job running
    if( this._currentJob ) {
      return;
    }

    // get next job
    var job = this._queue.shift();

    // set current job
    this._currentJob = job;

    // remember start of execution
    job['startTime'] = Date.now();

    // execute
    if( job['m'].indexOf( 'dummy' ) > -1 ) {

      try {

        // load module
        const module = await requireP( job['m'] );

        // exec
        const result = await module( job['p'] );

        // relay results
        if( result instanceof Error ) {
          this._failHandler( error( 'store/job', result ) );
        } else {
          this._doneHandler( result );
        }

      } catch( e ) {
        this._failHandler( e );
      }

    } else {

      // execute the respective function
      try{
            // load module
            const module = await requireP( job['m'] );

            // execute
            const rawRes = module[ job['c'] ]( job['p'] );

            // attach progress handler, if available
            if( 'progress' in rawRes ) {
              rawRes.progress( this._progressHandler.bind( this ) );
            }

            // wait to finish
            const result = await rawRes;

            // relay results
            if( result instanceof Error ) {
              this._failHandler( error( 'store/job', result ) );
            } else {
              this._doneHandler( result );
            }

      } catch(e) {

        this._failHandler( error( `${job['m']}.${job['c']}`, e ) );

      }

    }

  };


  // exports
  return Queue;
});