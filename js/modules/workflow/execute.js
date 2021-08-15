/**
 * (re-)execute a given workflow
 */
"use strict";
define( [ 'store/job'
], function(
          JobQueue,
){

  // export the function
  return exec;

  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX exec XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  function exec( params, parse ) {

    return new Promise( async (resolve,reject) => {

      try{

        // parse workflow
        const cmd = await parse( params['workflow'] );

        // queue variables
        let curAct;

        // create job queue
        const jobs = new JobQueue(
              function( d ){ /* DONE */

                // save data_id to curAct
                curAct[ 'data_id' ] = d['params']['data_id'];

                if( cmd['stack'].length > 0 ) {

                  // get next activity
                  curAct = cmd['stack'].pop();

                  // get the data_ids for all used datasets
                  let used = curAct['uses']
                               ? curAct['uses'].map( (id) => cmd['lookup'][ id ]['data_id'] )
                               : [];

                  // augment with data_id
                  augmentDataIds( curAct['command'], used );

                  // execute it
                  jobs.addJob( curAct['command'] );

                } else {

                  // we are done
                  resolve({
                   'action': 'done',
                   'params': {
                     'data_id': curAct[ 'data_id' ]
                   },
                   '_wfHints': {
                     'noWFEntry': true
                   }
                  });

                }

              },
              function( e ){ /* FAIL */

                // fail the workflow execution as well
               reject( e );

              },
              function( p ){ /* PROGRESS */

                // do nothing

              }
        );

        // queue first command
        curAct = cmd['stack'].pop();
        jobs.addJob( curAct['command'] );

      } catch ( e ) {
        reject( e );
      }

    });

  };


  /**
   * augment the given command with the given data_ids
   * this depends on the number of used entries
   * TODO improve this (hardcoded) approach
   *
   * @param   {Object]          command     the command to be issued
   * @param   {Array[Number]}   used        the indices of used datasets
   * @returns {Object}                      the augmented command (same reference as input)
   */
  function augmentDataIds( command, used ) {

    switch( used.length ) {

      // no dependency
      case 0: return command;

      // single dependency: data_id
      case 1: command.params.data_id = used[0];
              return command;

      // two dependencies: base_data_id, augm_data_id
      case 2: command.params.data_id      = used[0];
              command.params.augm_data_id = used[1];
              return command;

       // everything else: some implementation is missing
       default: throw new Error( 'Missing implementation!' );

    }

  }

})
