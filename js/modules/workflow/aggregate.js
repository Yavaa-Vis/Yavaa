"use strict";
/*
 * aggregate the workflow entries for a specific dataset entry
 * following principles of http://www.w3.org/Submission/2013/SUBM-prov-json-20130424/
 */
define( [ 'basic/error' ], function( Error ){

  // fields used to track stuff, while processing
  var idField = '__id',                 // used to keep track of workflow entries
      resultField = '__resultEntity';   // used to track resulting entities of a workflow


  // symbols; will not be serialized in output
  const symbols = {
      colsAfter: Symbol.for( 'columns present in a dataset after an activity' ),
      linkedActivity: Symbol.for( 'the PROV activity this entry is linked to' ),
      linkedResult:   Symbol.for( 'the PROV entitiy representing the result of this entry' ),
  };

  async function aggregate( wfEntry ) {

    // id counter
    const idCounter = {
      'entity':   0,
      'activity': 0,
      'relation': 0,
      'column':   0,
    };

    // JSON result
    const wfData = {

        // objects
        'entities': {},
        'activities': {},

        // relations
        'used': {},
        'wasDerivedFrom': {},
        'wasGeneratedBy': {},
        'wasInfluencedBy': {},
        'hadMember':      {},
    };

    // XXXXXXXXX Step1: walk entries in pre-order; getting activity dependencies

    // create processing stack; starting element is given by wfEntry
    let stack = [{
      parentID: null,
      wfEntry: wfEntry
    }];

    while( stack.length > 0 ) {

      // get item to process
      const entry = stack.pop(),
            wfEntry = entry.wfEntry;

      // process current entry
      let parentID;
      switch( wfEntry.getData('type') ) {

        case 'load': parentID = handleLoad( wfData, idCounter, wfEntry, entry.parentID );
                     break;

        case 'comp': parentID = handleComp( wfData, idCounter, wfEntry, entry.parentID );
                     break;

        case 'viz':  parentID = handleViz(  wfData, idCounter, wfEntry, entry.parentID );
                     break;

        case 'join': parentID = handleJoin( wfData, idCounter, wfEntry, entry.parentID );
                    break;

        default: throw new Error( 'workflow/aggregate', 'Unknown workflow entry type: ' + wfEntry.getData('type') );
      }

      // queue up child workflow entries, if a parentLink is given (loads give none)
      if( parentID ) {
        const prev = wfEntry.getData( '_previous' );
        if( prev ) {

          if( prev instanceof Array ) {

            // add to stack (reverse order to ensure processing the correct order)
            for( let i=prev.length; i--; ) {
              stack.push({
                parentID: parentID,
                wfEntry: prev[i]
              });
            }

          } else {

            // add to stack
            stack.push({
              parentID: parentID,
              wfEntry: prev
            });

          }
        }
      }
    }

    // XXXXXXXXX Step2: walk entries in post-order; adding column entities and their relations

    // create a processing stack
    // all entries should afterwards be in an order, such that we always process dependencies before the actual activity
    stack = [];
    const traversalStack = [ wfEntry ];
    while( traversalStack.length > 0 ) {

      // get the head
      const entry = traversalStack.pop();

      // put it into the final stack
      stack.push( entry );

      // push its children to the traversal stack
      const prev = entry.getData( '_previous' );
      if( prev instanceof Array ) {
        for( let i=prev.length; i--; ) {
          traversalStack.push( prev[i] );
        }
      } else {
        if( prev ) {
          traversalStack.push( prev );
        }
      }
    }

    // process the actual stack now
    while( stack.length > 0 ){

      // shortcuts
      const entry     = stack.pop(),
            colsWf    = entry.getData( 'columns' ),
            actId     = entry[ symbols.linkedActivity ],
            resultId  = entry[ symbols.linkedResult ];

      // previous activities
      const prev = entry.getData( '_previous' );

      // get list of columns before the activity; some distinctions according to type
      let colsPrev;
      switch( entry.getData('type') ) {

        case 'join':  // list is the concat of the column list of each source
                      // join is currently just used for two inputs
                      colsPrev = prev[0][ symbols.colsAfter ].concat( prev[1][ symbols.colsAfter ] );
                      break;

        default:      // load + comp;
                      // list of resulting columns from previous activity;
                      // there should be at most one activity in _previous, which has been processed already
                      colsPrev = prev ? prev[ symbols.colsAfter ] : [];

      }

      // add the columns; returned is the set of columns after the activity
      const colsProv = addColumns( wfData, entry, colsWf, colsPrev, actId, resultId, idCounter )

      // save columns after
      entry[ symbols.colsAfter ] = colsProv;

    } // end while

    // return the PROV-JSON object (not yet serialized)
    return wfData;

  }


  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXX linkToParent XXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  /**
   * link an activity and the respective resulting entity to the parent activity
   */
  function linkToParent( result, idCounter, newEntId, newActId, parentId ) {

    // root of the workflow tree
    if( !parentId ) {
      return;
    }

    // get parent activity
    var parentAct = result['activities'][ parentId ];

    // add to 'yavaa:prevActivity'
    parentAct['yavaa:prevActivity'].push( newActId );

    // add "used" link
    result['used'][ 'used' + idCounter['relation']++ ] = {
        'prov:activity': parentId,
        'prov:entity':   newEntId
    };

    // mark connecting entity as intermediate
    result['entities']
          [ newEntId ]
          [ 'yavaa:intermediateResult' ] = true;

  }


  /**
   * link a workflow entry to the respective PROV objects
   */
  function linkToProv( wfEntry, actId, resultId ) {

    // the respective activity
    wfEntry[ symbols.linkedActivity ] = actId;

    wfEntry[ symbols.linkedResult ] = resultId;
  }


  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Load Item XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  function handleLoad( result, idCounter, item, parentId ) {

    // create an entity for the source dataset
    const sourceId = 'source' + idCounter['entity']++;
    result['entities'][ sourceId ] = {
        'prov:atLocation':  item.getData( 'source/url' ),
        'yavaa:type':       item.getData( 'source/type' ),
        'yavaa:datasetId':  item.getData( 'source/datasetId' ),
        'yavaa:distrId':    item.getData( 'source/distrId' ),
        'dct:publisher':    item.getData( 'source/publisher' ),
        'dct:title':        item.getData( 'source/title' )
    };

    // activity for loading
    const actId = 'load' + idCounter['activity']++,
          actStartTime = (new Date( item.getData( 'startTime' ) )).toISOString(),
          actEndTime =   (new Date( item.getData( 'endTime' ) )).toISOString();
    result['activities'][ actId ] = {
        'prov:startTime':   actStartTime,
        'prov:endTime':     actEndTime,
        'prov:type':        { '$': convertType( item.getData( 'type' ) ), 'type': 'xsd:QName' },
        'yavaa:action':     item.getData( 'action' ),
        'yavaa:columns':    item.getData( 'columns' ),
        'yavaa:params':     JSON.stringify( item.getData('params') ),
        'yavaa:prevActivity': null
    };

    // add connection between activity and loaded resource
    result['used'][ 'used' + idCounter['relation']++ ] = {
        'prov:activity':  actId,
        'prov:entity':    sourceId
    };

    // resulting (intermediate?) entity
    const newEntId = 'result' + idCounter['entity']++;
    result['entities'][ newEntId ] = {
        'prov:type': { '$': 'prov:Collection', 'type': 'xsd:QName' },
    };

    // link to resulting entity
    result['wasGeneratedBy'][ 'wasGeneratedBy' + idCounter['relation']++ ] = {
        'prov:entity':    newEntId,
        'prov:activity':  actId
    };

    // add links
    linkToParent( result, idCounter, newEntId, actId, parentId );
    linkToProv( item, actId, newEntId );

    return null;
  }

  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Comp Item XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  function handleComp( result, idCounter, item, parentId ) {

    // activity data
    var actId = 'comp' + idCounter['activity']++,
        actStartTime = (new Date( item.getData( 'startTime' ) )).toISOString(),
        actEndTime = (new Date( item.getData( 'endTime' ) )).toISOString();

    // activity entry
    result['activities'][ actId ] = {
        'prov:startTime':   actStartTime,
        'prov:endTime':     actEndTime,
        'prov:type':        { '$': convertType( item.getData( 'type' ) ), 'type': 'xsd:QName' },
        'yavaa:params':     JSON.stringify( item.getData('params') ),
        'yavaa:action':     item.getData( 'action' ),
        'yavaa:columns':    item.getData( 'columns' ),
        'yavaa:prevActivity': []
    };

    // resulting (intermediate?) entity
    var newEntId = 'result' + idCounter['entity']++;
    result['entities'][ newEntId ] = {
        'prov:type': { '$': 'prov:Collection', 'type': 'xsd:QName' },
    };

    // link to resulting entity with activity
    result['wasGeneratedBy'][ 'wasGeneratedBy' + idCounter['relation']++ ] = {
        'prov:entity':    newEntId,
        'prov:activity':  actId
    };

    // save link to generated entity
    item[ resultField ] = newEntId;

    // add links
    linkToParent( result, idCounter, newEntId, actId, parentId );
    linkToProv( item, actId, newEntId );

    return actId;
  }

  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Join Item XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  function handleJoin( result, idCounter, item, parentId ) {

    // activity data
    var actId = 'join' + idCounter['activity']++,
        actStartTime = (new Date( item.getData( 'startTime' ) )).toISOString(),
        actEndTime = (new Date( item.getData( 'endTime' ) )).toISOString();

    // activity entry
    result['activities'][ actId ] = {
        'prov:startTime':   actStartTime,
        'prov:endTime':     actEndTime,
        'prov:type':        convertType( item.getData( 'type' ) ),
        'yavaa:params':     JSON.stringify( item.getData('params') ),
        'yavaa:action':     item.getData( 'action' ),
        'yavaa:columns':    item.getData( 'columns' ),
        'yavaa:prevActivity': []
    };

    // resulting (intermediate?) entity
    var newEntId = 'result' + idCounter['entity']++;
    result['entities'][ newEntId ] = {
        'prov:type': { '$': 'prov:Collection', 'type': 'xsd:QName' },
    };

    // link to resulting entity
    result['wasGeneratedBy'][ 'wasGeneratedBy' + idCounter['relation']++ ] = {
        'prov:entity':    newEntId,
        'prov:activity':  actId
    };

    // add links
    linkToParent( result, idCounter, newEntId, actId, parentId );
    linkToProv( item, actId, newEntId );

    return actId;
  }

  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Viz Item XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  function handleViz( result, idCounter, item ) {

    // respective activity
    const actId = 'viz' + idCounter['activity']++,
          actStartTime  = (new Date( item.getData( 'startTime' ) )).toISOString(),
          actEndTime    = (new Date( item.getData( 'endTime' ) )).toISOString();
    result['activities'][ actId ] = {
        'prov:startTime':   actStartTime,
        'prov:endTime':     actEndTime,
        'prov:type':        convertType( item.getData( 'type' ) ),
        'yavaa:params':     JSON.stringify( item.getData('params') ),
        'yavaa:action':     item.getData( 'action' ),
        'yavaa:columns':    item.getData( 'columns' ),
        'yavaa:prevActivity': []
    };

    // add links
    linkToProv( item, actId, null );

    return actId;

  }

  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXX Column entities XXXXXXXXXXXXXXXXXXXXXXXXXX */

  /**
   * add column-entities
   */
  function addColumns( wfData, entry, colsWf, colsPrev, actId, resultId, idCounter ){

    // column list after this activity
    const colsProv  = [];

    // process each column
    for( let i=0; i<colsWf.length; i++ ) {

      // the columns ID
      let colId;

      // new vs existing column
      if( (colsWf[i]['former'] == null) || (colsWf[i]['basedOn'] != null) ) {

        // new column; may be dependent on an old one

        // new PROV-object's ID
        colId = 'column' + idCounter['column']++;

        // add entity to result
        wfData['entities'][ colId ] = {
          'dct:title':   colsWf[i]['label']
        };

        // link to the creating activity
        wfData['wasGeneratedBy'][ 'wasGeneratedBy' + idCounter['relation']++ ] = {
            'prov:entity':    colId,
            'prov:activity':  actId,
        };

        // if this is a modified column, ...
        if( colsWf[i]['former'] != null ){

          // get original
          const sourceCol = colsPrev[ colsWf[i]['former'] ];

          // link both
          wfData['wasDerivedFrom'][ 'wasDerivedFrom' + idCounter['relation']++ ] = {
              'prov:generatedEntity': colId,
              'prov:usedEntity':      sourceCol,
          };

          // copy it's name
          wfData['entities'][ colId ][ 'dct:title' ] = wfData['entities'][ sourceCol ][ 'dct:title' ];

        }

      } else {

        // existing column
        colId = colsPrev[ colsWf[i]['former'] ];

      }

      // other column dependencies
      if( colsWf[i]['basedOn'] != null ) {

        // link to influencing columns
        // there should be a previous activity along with resulting columns
        for( let j=0; j<colsWf[i]['basedOn'].length; j++ ) {
          wfData['wasInfluencedBy'][ 'wasInfluencedBy' + idCounter['relation']++ ] = {
              'prov:influencer': colsPrev[ colsWf[i]['basedOn'][j] ],
              'prov:influencee': colId,
          };
        }

      }

      // store columns list
      colsProv.push( colId );

      // link to the resulting dataset
      wfData['hadMember'][ 'hadMember' + idCounter['relation']++ ] = {
          'prov:collection': resultId,
          'prov:entity':     colId,
      };

    }

    return colsProv;

  }

  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Types2ProvTypes XXXXXXXXXXXXXXXXXXXXXXX */

  function convertType( type ) {
    return 'yavaa:' + type;
  }


  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Export XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */
  return aggregate;

});