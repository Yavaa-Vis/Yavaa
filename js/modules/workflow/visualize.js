"use strict";
/*
 * visualize a given (JSON serialized) workflow
 */
define( [
  'text!template/workflow/base.svg',
  'text!template/workflow/styles.css'
], function(
    baseTempl,
    stylesTempl
){

  const CONSTANTS = {
          activity: 0,
          entity: 1
        },
        DRAW_CONSTANTS = {
          colWidth: 60,
          colPadding: 5,
          objMargin: 15,
          objHeight: 20,
          usedColModX1: 10,
          usedColModX2: 2
        },
        DEBUG = false;     // setting to true will include more information in the resulting SVG

  // remove comments from styles
  stylesTempl = stylesTempl.replace( /\/\*[\s\S]*?\*\//gi, '' );


  function parse( prov, includeStyles ) {


    let objects = []            // entities and activities
        , columns = []          // column data
        // temporary variables
        , obj, keys, act, ent, prev, next, level
        , actKey, entKey
        , cols, col, mapping, used, changed, prevMapping, colId, newCol;

    const ids = {  // respective ids for all involved entities and activities
        'act': Object.keys( prov['activities'] ),
        'ent': Object.keys( prov['entities'] ),
        'hadMember': new Set(),
    };

    // collect all columns
    // hadMember represents the relation between columns and datasets
    Object.values( prov['hadMember'] ).map( (c) => ids['hadMember'].add( c['prov:entity'] ) );

    // remove column entities from list of entities
    ids['ent'] = ids['ent'].filter( e => !ids['hadMember'].has( e ) );

    /* ============================= 1. Insert all objects ============================= */

    // activities
    keys = ids['act'];
    for( let i=keys.length; i--; ) {

      // create object
      obj = {
        'type':   CONSTANTS.activity,
        'key':    keys[i],
        'entry':  prov['activities'][ keys[i] ],
        'level': 0,
        'next': null,
        'prev': [],
        'colMapping': []
      };

      // link to origin
      prov['activities'][ keys[i] ][ 'paintObject' ] = obj;

      // insert to object list
      objects.push( obj );
    }


    // entities
    keys = ids['ent'];
    for( let i=0; i<keys.length; i++ ) {

      // create object
      obj = {
        'type':   CONSTANTS.entity,
        'key':    keys[i],
        'entry':  prov['entities'][ keys[i] ],
        'level': 0,
        'next': null,
        'prev': [],
        'colMapping': null
      };

      // link to origin
      prov['entities'][ keys[i] ][ 'paintObject' ] = obj;

      // insert to object list
      objects.push( obj );

    }


    /* ====================== 2. Insert all links between objects ====================== */

    // "used"
    if( 'used' in prov) {
      keys = Object.keys( prov['used'] );
      for( let i=0; i<keys.length; i++ ) {

        // get keys
        actKey = prov['used'][ keys[i] ]['prov:activity'];
        entKey = prov['used'][ keys[i] ]['prov:entity'];

        // only process valid entities (those not filtered before)
        if( !ids['ent'].includes( entKey ) ) {
          continue;
        }

        // get involved activity and entity
        act = prov['activities'][ actKey ]['paintObject'];
        ent = prov['entities']  [ entKey ]['paintObject'];

        // update respective entries in objects
        ent['next'] = act;
        act['prev'].push( ent );
      }

    }

    // "wasGeneratedBy"
    if( 'wasGeneratedBy' in prov) {
      keys = Object.keys( prov['wasGeneratedBy'] );
      for( let i=0; i<keys.length; i++ ) {

        // get keys
        actKey = prov['wasGeneratedBy'][ keys[i] ]['prov:activity'];
        entKey = prov['wasGeneratedBy'][ keys[i] ]['prov:entity'];

        // only process valid entities (those not filtered before)
        if( !ids['ent'].includes( entKey ) ) {
          continue;
        }

        // get involved activity and entity
        act = prov['activities'][ actKey ]['paintObject'];
        ent = prov['entities']  [ entKey ]['paintObject'];

        // update respective entries in objects
        act['next'] = ent;
        ent['prev'].push( act );
      }

    }

    /* ======================== 3. Remove intermediate results ======================== */

    keys = ids['ent'];
    for( let i=0; i<keys.length; i++ ) {

      // shortcut
      ent = prov['entities'][ keys[i] ];

      // is it an intermediate result?
      if( ('yavaa:intermediateResult' in ent) && (ent['yavaa:intermediateResult'] == true) ) {

        // shortcut
        obj = ent[ 'paintObject' ]
        next = obj['next'];

        // update previous object
        for( let j=obj['prev'].length; j--; ) {
          obj['prev'][j]['next'] = next;
        }

        // remove this object from the "prev" list of the next object
        next['prev'].splice( next['prev'].indexOf( obj ), 1 );

        // update next object
        next['prev'] = next['prev'].concat( obj['prev'] );

        // mark this object as removable
        obj['removable'] = true
      }

    }


    // finally remove dead entries from objects
    objects = objects.filter( function(o){
      return !(('removable' in o) && o['removable']);
    });


    /* ======================== 4. Assign levels to all sources ======================= */
    /*                             * source => level = 0                                */
    /*                             * else => level = max( prev ) + 1                    */

    keys = ids['ent'];
    for( let i=0; i<keys.length; i++ ) {

      // shortcut
      obj = prov['entities'][ keys[i] ]['paintObject'];

      // we don't care about some entities anymore
      if( (('removable' in obj) && (obj['removable'] === true))   // intermediate results
          || (obj['prev'].length > 0)                             // not source objects
          ) {
        continue;
      }

      // set level to 0
      obj['level'] = 0;

      // update levels for all successors
      level = 1; next = obj['next'];
      while( next != null ) {

        // if the successor is already on a higher level, we can stop
        if( next['level'] >= level ) {
          break;
        }

        // update level
        next['level'] = level;

        // next round
        level += 1;
        next = next['next'];

      }

    }

    /* ========================== 5. Create global column mappings ===================== */

    // sort objects
    objects.sort( function( a, b ){

      if( (a['type'] == CONSTANTS.activity) && (b['type'] == CONSTANTS.activity) ) {

        // both elements are activities
        return (a['level'] - b['level'])
              || a['entry']['prov:startTime'].localeCompare( b['entry']['prov:startTime'] );

      } else {

        // at least one entity
        return (a['level'] - b['level']);

      }

    });

    // traverse all objects
    for( let i=0; i<objects.length; i++ ) {

      // we do not need to process entities in this step
      if( objects[i]['type'] == CONSTANTS.entity ) {
        continue;
      }

      // some shortcuts
      obj = objects[i];
      cols = obj['entry']['yavaa:columns'];

      // column mapping after this activity
      mapping = [];

      // touched columns == the columns that got modified/deleted/...
      changed = [];

      // used columns
      // == the columns that influenced the activity (besides being modified themselves)
      used = {};

      // get previous mappings
      if( obj['prev'].length > 0 ) {
        prevMapping = [].concat
                        .apply( [],
                          obj['prev'].filter( function( el ){
                                      return el['type'] != CONSTANTS.entity;
                                    })
                                    .map( function( el ){
                                      return el['colMapping'];
                                    })
                        );
      } else {
        prevMapping = [];
      }

      // traverse all columns
      colId = -1; // index of the last column in global array
      for( let j=0; j<cols.length; j++ ) {

        if( !('former' in cols[j]) || ( cols[j]['former'] == null ) ) {

          // CASE 1: this is a new column

          // where to add in global columns array
          colId = j > 0
                    ? columns.indexOf( mapping[ mapping.length - 1 ] ) + 1 // directly after the last column
                    : columns.length ;                                     // or at the end

          // create new column
          newCol = {
            's': obj,               // activity, where started
            'e': null,              // activity, where ended
            'i': 0,                 // position within the global array
            'n': cols[j]['label'],  // label for the column
            'c': cols[j]['order']   // col id as in the actual computing engine
          };

          // insert new column to global
          columns.splice( colId, 0, newCol );

          // insert new column to after mask
          mapping.push( newCol );

          // save as touched
          changed.push( newCol );

          // remember which columns were used
          if( ('basedOn' in cols[j]) && (cols[j]['basedOn'] != null) ) {
            for( let k=0; k<cols[j]['basedOn'].length; k++) {
              used[ cols[j]['basedOn'][k] ] = true;
            }
          }

        } else {

          // CASE 2: column has existed before

          // insert into mapping
          mapping.push( prevMapping[ cols[j]['former'] ] );

          // remember which columns were used
          if( ('basedOn' in cols[j]) && (cols[j]['basedOn'] != null) ) {

            changed.push( prevMapping[ cols[j]['former'] ] );

            for( let k=0; k<cols[j]['basedOn'].length; k++) {
              used[ cols[j]['basedOn'][k] ] = true;
            }
          }

          // update index as used inside the engine
          prevMapping[ cols[j]['former'] ][ 'c' ] = cols[j]['order'];

        }
      }

      // mark ending for dropped columns
      if( (prevMapping.length > 0) && (prevMapping.length != mapping.length) ) {
        for( let j=prevMapping.length; j--; ) {
          if( mapping.indexOf( prevMapping[j] ) < 0 ) {
            prevMapping[j]['e'] = obj;
            used[ j ] = true;
          }
        }
      }

      // make a list of used columns
      obj['usedColumns'] = [];
      if( prevMapping ) {
        Object.keys( used )
              .forEach( function(key){
                obj['usedColumns'].push( prevMapping[key] );
              });
      }

      // save mapping
      obj['colMapping'] = mapping;
      obj['changedCol'] = changed;

    }

    // add indizes to all column objects
    for( let i=columns.length; i--; ) {
      columns[i]['i'] = i;
    }

    /* ============================ 6. Paint Objects and Columns ======================= */

    // the current output state
    let outState = {
        'y': DRAW_CONSTANTS.objHeight,    // current value for the last Y value that got used
                                          // compensate for sources, which are always on top
        'obj': [],                        // all rendered objects
        'col': [],                        // all rendered column fragments
        'usedCol': []                     // all rendered used column fragments
    }

    for( let i=0; i<objects.length; i++ ) {

      // shortcuts
      obj = objects[i];

      // paint object
      switch( obj.type ) {
        case CONSTANTS.entity:    paintEntity( obj, outState ); break;
        case CONSTANTS.activity:  paintActivity( obj, outState ); break;
        default: console.error( 'Unknown type!' );
      }

    }

    // final dimensions
    const totalWidth  = (columns.length * DRAW_CONSTANTS.colWidth),
          totalHeight = outState['y'];

    const out = baseTempl.replace( /{totalWidth}/g, totalWidth + 10 )
                        .replace( /{totalHeight}/g, totalHeight )
                        .replace( '{col}', outState['col'].join("\n") )
                        .replace( '{usedcol}', outState['usedCol'].join("\n") )
                        .replace( '{obj}', outState['obj'].join("\n") )
                        .replace( '{style}', `width: ${2*totalWidth}px; height: ${2*totalHeight}px` )
                        .replace( '{styledef}', includeStyles ? stylesTempl : '' )
                        ;

    return out;

    /* ================================== Painting Functions =========================== */

    /* ------------------------------------- paintEntity() ----------------------------- */

    function paintEntity( obj, state ) {

      // get the column mapping for this entity
      let cols;
      if( obj['prev'].length > 0 ) {
        // if there is a previous, take that
        // an entity can only just have one previous (generating) activity
        cols = obj['prev'][0]['colMapping'];
      } else {
        // else take the mapping from the next activity
        cols = obj['next']['colMapping'];
      }

      // if this is a result, print column entities again
      if( !obj['next'] ) {

        // paint entities
        paintColEntities(cols, state, true );

        // add connectors
        let y = state['y'] + DRAW_CONSTANTS.objMargin + DRAW_CONSTANTS.objHeight / 2;
        for( let i=0; i<cols.length; i++ ) {
          paintColConnector( state, cols[i], y, state['y'] );
        }

        // update global Y
        state['y'] += DRAW_CONSTANTS.objMargin;
      }

      // get the expansion along y-axis
      let min = cols[0]['i'], max = min;
      for( let i=1; i<cols.length; i++ ) {
        min = min < cols[i]['i'] ? min : cols[i]['i'];
        max = max > cols[i]['i'] ? max : cols[i]['i'];
      }

      // determine title
      if( !obj['next'] ) {

        // Result entity
        obj['title'] = 'Result';

      } else {

        // Source entity
        obj['title'] = ('dct:title' in obj['entry']) ? obj['entry']['dct:title'] : obj['key'];

      }

      // set coordinates for element
      obj['x'] = (min + (max - min + 1) / 2) * DRAW_CONSTANTS.colWidth;
      obj['y'] = state['y'] + DRAW_CONSTANTS.objHeight / 2;
      obj['xradius'] = ((max - min + 1) / 2) * DRAW_CONSTANTS.colWidth * 0.95;
      obj['yradius'] = DRAW_CONSTANTS.objHeight / 2;

      // if this is a source, paint it at the top
      if( obj['prev'].length < 1 ) {
        obj['y'] = DRAW_CONSTANTS.objHeight / 2;
      }

      // build entity object and insert to collection
      state['obj'].push( `<g class="entity source" transform="translate( ${obj['x']} ${obj['y']})">
                            <title>${JSON.stringify( obj['title'] )}</title>
                            <ellipse cx="0"
                                     cy="0"
                                     rx="${obj['xradius']}"
                                     ry="${obj['yradius']}" />
                            ${getText( obj['title'],
                                       obj['xradius'],
                                       obj['yradius'] )}
                          </g>` );

      // update last Y used
      if( obj['prev'].length > 0 ) {
        state['y'] += DRAW_CONSTANTS.objHeight;
      }
    }


    /* ------------------------------------ paintActivity() ---------------------------- */

    function paintActivity( obj, state ) {

      // paint columns entities for those, that ended here
      if( 'usedColumns' in obj ) {

        // determine columns that ended
        let delColumns = [];
        for( let i=0; i<obj['usedColumns'].length; i++ ) {

          if( obj['colMapping'].indexOf( obj['usedColumns'][i] ) < 0 ) {
            delColumns.push( obj['usedColumns'][i] );
          }

        }

        // if we found some, paint them
        if( delColumns.length > 0 ) {
          paintColEntities(delColumns, state);
        }
      }

      // get affected columns
      let cols;
      if( obj['changedCol'].length > 0 ) {
        // if it changed columns, these form the span
        cols = obj['changedCol'];
      } else {
        // else we take all that got used for this activity
        cols = obj['usedColumns'];
      }

      // get the expansion along y-axis
      let min = cols[0]['i'], max = min;
      for( let i=1; i<cols.length; i++ ) {
        min = min < cols[i]['i'] ? min : cols[i]['i'];
        max = max > cols[i]['i'] ? max : cols[i]['i'];
      }

      // leave space for columns connectors
      state['y'] += DRAW_CONSTANTS.objMargin;

      // set coordinates for element
      obj['x'] = min * DRAW_CONSTANTS.colWidth;
      obj['y'] = state['y'];
      obj['width'] = (max - min + 1) * DRAW_CONSTANTS.colWidth;
      obj['height'] = DRAW_CONSTANTS.objHeight;

      // title object (only in debug mode)
      const title = `<title>{ k: obj.key, p: obj.entry['yavaa:params']} )}</title>`

      // build object and add to collection
      state['obj'].push( `<g class="activity">
                            ${DEBUG ? title : '' }
                            <rect x="${obj['x']}"
                                  y="${obj['y']}"
                                  width="${obj['width']}"
                                  height="${obj['height']}" />
                            <text x="${( obj['x'] + obj['width'] / 2 )}"
                                  y="${( obj['y'] + obj['height'] / 2 )}">
                              ${obj['entry']['yavaa:action']}
                            </text>
                          </g>` );

      // we painted the object now
      state['y'] += DRAW_CONSTANTS.objHeight;

      // draw column connectors
      if( obj['prev'][0]['type'] == CONSTANTS.entity ) {

        // LOAD EVENTS

        // get respective source
        let source = obj['prev'][0];

        // single connection to the sources
        paintColConnector(state, { 'i': ( min + (max - min)/2 )}, obj['y'], source['y'] + source['yradius'] );

        // create column starting entries
        paintColEntities( cols, state );

      } else {

        // other activities: connect the columns

        for( let i=0; i<cols.length; i++ ){
          paintColConnector(state, cols[i], state['y'] - DRAW_CONSTANTS.objHeight, cols[i]['y'] );
          cols[i]['y'] = state['y'];
        }

        // TODO pointers to used, but not changed columns
        // for now just connect all
        if( obj['changedCol'].length > 0 ) {

          let usedCols = obj['usedColumns'];
          for( let i=0; i<usedCols.length; i++ ){

            // just draw for those, that were not already connected
            if( cols.indexOf( usedCols[i] ) >= 0 ) {
              continue;
            }

            paintUsedColConnector( state,
                                   usedCols[i],
                                   obj,
                                   state['y'] - DRAW_CONSTANTS.objHeight / 2,
                                   state['y'] - DRAW_CONSTANTS.objHeight - DRAW_CONSTANTS.objMargin / 2
                                  );
          }
        }
      }

    }

    /* ---------------------------------- paintColEntities() --------------------------- */

    /**
     * @param   {array}   cols      columns to paint
     * @param   {object}  state     current paint state
     * @param   {boolean} addData   add column information for interactive components
     */
    function paintColEntities( cols, state, addData ) {

      // increment state.y
      state['y'] += DRAW_CONSTANTS.objMargin;

      // connectors to previous activity
      let y;
      for( let i=0; i<cols.length; i++ ) {
        // if the column connector already started, use that value
        // else use the default distance to next activity
        y = cols[i]['y'] ? cols[i]['y'] : (state['y'] - DRAW_CONSTANTS.objMargin);
        paintColConnector( state, cols[i], state['y'], y );
      }

      // entities
      let data = '';
      for( let i=0; i<cols.length; i++ ) {

        // add column data, if necessary
        if( addData ) {
          data = 'data-col="' + cols[i]['c'] + '" ';
        }

        // add column
        state['obj'].push(`<g class="entity col" ${data} transform="translate( ${((cols[i]['i'] + 0.5) * DRAW_CONSTANTS.colWidth)} ${(state['y'] + DRAW_CONSTANTS.objHeight / 2 )})">
                              <title>${cols[i]['n']}</title>
                              <ellipse cx="0"
                                       cy="0"
                                       rx="${((DRAW_CONSTANTS.colWidth - DRAW_CONSTANTS.colPadding) / 2 )}"
                                       ry="${(DRAW_CONSTANTS.objHeight / 2)}" />
                              ${getText( cols[i]['n'],
                                         ((DRAW_CONSTANTS.colWidth - DRAW_CONSTANTS.colPadding) / 2 ),
                                         (DRAW_CONSTANTS.objHeight / 2),
                                         true )}
                            </g>` );
      }

      // update last used Y
      state['y'] += DRAW_CONSTANTS.objHeight;

      // set start values for new column connectors
      for( let i=0; i<cols.length; i++ ) {
        cols[i]['y'] = state['y'];
      }

    }

    /* ---------------------------------- paintColConnector() -------------------------- */

    function paintColConnector( state, col, y1, y2 ) {

      // if one endpoint is unknown, draw nothing
      if( (typeof y1 != 'number') || (typeof y2 != 'number') ) {
        return;
      }

      // adjust for arrow head
      y2 += 3;

      // add column
      state['col'].push( '<path d="m ' + ((col['i'] + 0.5) * DRAW_CONSTANTS.colWidth) + ',' + y1 + ' '
                               + ' 0, ' + (y2 - y1) + '" />' );
    }

    /* -------------------------------- paintUsedColConnector() ------------------------ */

    function paintUsedColConnector( state, col, act, y1, y2 ) {

      // adjust for arrow head
      y2 += 3;

      // get column x value
      let colX = (col['i'] + 0.5) * DRAW_CONSTANTS.colWidth;

      // middle of activity box
      let actMidX = act['x'] + ( act['width'] / 2 );

      // is the column left or right of the middle?
      let colXMod1, colXMod2;
      if(colX > actMidX) {
        colXMod1 = 0 - DRAW_CONSTANTS.usedColModX1;
        colXMod2 = 0 - DRAW_CONSTANTS.usedColModX2;
      } else {
        colXMod1 = DRAW_CONSTANTS.usedColModX1;
        colXMod2 = DRAW_CONSTANTS.usedColModX2;
      }

      // add column
      state['usedCol'].push( '<path d="M ' + actMidX            + ',' + y1 + ' '
                                           + (colX + colXMod1)  + ',' + y1 + ' '
                                           + (colX + colXMod2)  + ',' + y2 + '" '
                             + 'class="test" />' );
    }


    /* --------------------------------------- getText() ------------------------------- */

    /**
     * reduce the text to something displayable in the respective container
     *
     * uses an inscribed foreignObject
     * assumes font-size: 8px
     */
    function getText( label, xradius, yradius, isCol ) {

      // given font-size
      const fontSize = 8;

      // calc lower right corder
      const y = 1.2 * fontSize / 2,
            x = (xradius / yradius) * Math.sqrt( yradius*yradius - y*y );

      return `<foreignObject width="${2*x}" height="${2*y}" x="${-x}" y="${-y}">
                <xhtml:div class="${isCol ? 'col' : ''}" title="${label}" style="line-height: ${2*y}px">${label}</xhtml:div>
              </foreignObject>`

      const widthInChars = Math.ceil( 1.4 * width / 7 );

      label = label.length > widthInChars ? label.substr( 0, widthInChars ) : label;

      return `)<text x="0" y="0">${label}</text>`;

      return label.length > widthInChars ? label.substr( 0, widthInChars ) : label;
    }

  };

  return parse;
});