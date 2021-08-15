/**
 * convert the given workflow into a sequence of commands
 * commands are ordered by their distance from the root (== final result) in the workflow,
 * such that commands with no dependcies can be executed first
 */
"use strict";
define( [], function(){

  return parse;

  /**
   *
   * @param prov
   * @returns
   */
  async function parse( prov ) {

    // get level for all activities (no dependencies == 0, else max( dependencies ) + 1)
    const levels = {};
    function getLevelRec( id ) {

      // get respective element
      const el = prov['activities'][id];

      // shortcut, if level is already known
      if( id in levels ) {
        return levels[id];
      }

      // load events and other without dependencies
      if( !('yavaa:prevActivity' in el) || (el['yavaa:prevActivity'] == null) ){
        levels[ id ] = 0;
        return 0;
      }

      // get level of dependencies
      const childLevels = el['yavaa:prevActivity'].map( (id) => getLevelRec( id ) );
      levels[ id ] = Math.max( ...childLevels ) + 1;
      return levels[ id ];
    }

    // actually get activities and create commands
    const keys = Object.keys( prov['activities'] ),
          commandStack = [],
          commandRepo = {};
    for( let i=keys.length; i--; ) {

      // get level
      const level = getLevelRec( keys[i] );

      // create command entry in stack
      commandStack.push({
          level:    level,
          activity: keys[i],
          command:  createCommand( prov, keys[i] ),
          uses:     prov['activities'][ keys[i] ]['yavaa:prevActivity']
      });

      // add to commandRepo
      commandRepo[ keys[i] ] = commandStack[ commandStack.length - 1 ];
    }

    // sort in order of possible execution (used as stack)
    commandStack.sort( function(a,b){
      return b.level - a.level;
    });

    // make the result a promise
    return {
      'stack': commandStack,
      'lookup': commandRepo
    };
  }


  function createCommand( prov, id ){

    // get params, if present
    var params = JSON.parse( prov['activities'][id]['yavaa:params'] || '{}' );

    // return executable command
    return {
      'action': prov['activities'][id]['yavaa:action'],
      'params': params
    };

  }

});