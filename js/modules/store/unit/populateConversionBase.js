"use strict";
/**
 * gets the conversion base for the requested units and the conversion path
 * (including factors and offsets) to it.
 * results will be attached directly to the units, so they are cached
 *
 * attaches an object to each unit with the following form:
 * - base   ... the respective conversion base
 * - offset ... the conversion offset for the complete conversion
 * - factor ... the conversion factor for the complete conversion
 * - path   ... array for the conversions starting from source to base
 * -- factor  ... conversion factor to the next entry from the current one
 * -- offset  ... conversion offset to the next entry from the current one
 * -- via     ... current unit in the conversion trail
 *
 * an empty path array indicates, that the source unit already is the base unit
 *
 * scales are not treated as conversions here; simplifies from unit/store/convertUnits
 */
define([ 'basic/types/Unit',
         'basic/types/ArbNumber',
         'util/flatten.sparql',
         'comp/function/parseFormula',
         'comp/function/parseFormula/Constants',
         'comp/function/createFunction',
         'text!template/query/unit/convertUnits.rq',
         'text!template/query/unit/findConversionPath.rq',
], function(
          Unit,
          ArbNumber,
          flattenResult,
          parseFormula,
          parseFormulaConst,
          createFunction,
          queryConvertUnits,
          queryFindConversionPath
){

  // the property name under which to attach
  const propName = '_convBase';

  // some ArbNumber, we need a lot
  const one = ArbNumber( 1 ),
        zero = ArbNumber( 0 );

  /**
   * get the base unit and the conversion to it for a given array of units
   */
  function getConversionBase( units ) {

    // make sure we have an array for units
    if( !(units instanceof Array) ) {
      units = [ units ];
    }

    // make sure unit list is unique
    units = [ ... new Set( units ) ];

    // filter for already initialized units and convert to format for query
    var source = units.filter( function( unit ){
                    return !(propName in unit);
                  }),
        sourceInput = source.map( function( unit ){
                    return { 'value': unit.getURI(), 'type': 'uri' }
                  });

    // store conversion data
    var convData;

    // get conversion path to "base unit"
    return this._client.query( queryFindConversionPath,{
                    'units': sourceInput
                  })
                  .then( ( d ) => {

                    // add found units to source
                    for( var i=0; i<d.length; i++ ) {
                      sourceInput.push({
                        'value': d[i]['unit']['value'],
                        'type': 'uri'
                      });
                    }

                    // query for all involved conversions
                    return this._client.query( queryConvertUnits,{
                      'units': sourceInput
                    });
                  })
                  .then( ( d ) => {

                    // flatten result
                    convData = flattenResult( d );

                    // find paths and add to result
                    var result = [];
                    for( var i=0; i<source.length; i++ ) {

                      // get path
                      var path = getConvPath( convData, source[i].getURI() );

                      // is the unit already a base?
                      if( path.length == 1 ) {

                        // already a base unit
                        source[i]._setVal( propName, {
                          'base':   source[i],
                          'offset': ArbNumber( 0 ),
                          'factor': ArbNumber( 1 ),
                          'path': []
                        });

                      } else {

                        // unit is NOT as base unit

                        // calc conversion offset and factor
                        var factor = one.clone(),
                            offset = zero.clone();
                        for( var j=0; j<path.length; j++ ) {

                          // NOTE offsets currently can't happen as scales are ignored here

                          // use prefix factor
                          if( path[j].prefixFactor && (path[j].prefixFactor != 1) ){
                            path[j].factor = ArbNumber( path[j].prefixFactor );
                            factor = factor.mul( path[j].factor );
                          } else {
                            path[j].factor = one.clone();
                          }

                          // use conversion factor
                          if( path[j].convFactor && (path[j].convFactor != 1) ){
                            path[j].factor = ArbNumber( path[j].convFactor );
                            factor = factor.mul( path[j].factor );
                          }

                        }

                        // set conversion base at unit
                        source[i]._setVal( propName, {
                          'base': this.getUnit( path[ path.length - 1 ].unit ),
                          'offset': offset,
                          'factor': factor,
                          'path': path.map( (entry) => {
                            return {
                              'offset': zero.clone(),
                              'factor': entry.factor,
                              'via': this.getUnit( entry.unit )
                            }
                          })
                        });

                      }

                    }

                    return units;
                  });

  }


  /**
   * build a directed graph out of nodes
   * find a path from source to a base node
   * a base node is a node, that has no further connections
   */
  function getConvPath( nodes, source ) {

    // augment additional attributes for CONNections
    var CONN = Symbol( "Connection between units/scales" ),
        ID   = Symbol( "Actual ID for this node" ),
        PREV = Symbol( "Previous node on the path" ),
        MARKED = Symbol( 'Already processed item' );

    // build a lookup for the definitions
    var lookup = {},
        isUnit;
    for( var i=0; i<nodes.length; i++ ) {
      isUnit = 'unit' in nodes[i];

      nodes[i]['isUnit']  = isUnit;
      nodes[i][ CONN ]    = [];
      nodes[i][ ID ]      = isUnit ? nodes[i]['unit'] : nodes[i]['scale'];

      lookup[ isUnit ? nodes[i]['unit'] : nodes[i]['scale'] ] = nodes[i];
    }

    // TODO some better way of dealing with scales ...
    // workaround: we don't deal with scales in conversions here
    if( 'scale' in lookup[ source ] ) {
      return [ lookup[ source ] ];
    }

    // add CONNection only, if there is a valid endpoint
    function addConnection( from, to ) {
      if( to && ( to != from )) {
        from[ CONN ].push( to[ ID ] );
      }
    }


    // build graph
    var connected = [];
    for( var i=0; i<nodes.length; i++ ) {

      // establish both endpoints of connection between the same type
      var from = nodes[i];
      if( from['isUnit'] ) {

        // if there is a scale involved, only add that connection
        // else there will be ambiguities

        if( 'scale' in from ) {

          // add unit-scale-connections
          addConnection( from, lookup[ from['scale'] ] );

        } else {

          // add inter-unit-connections
          if( from['prefixBase'] == from['unit'] ) {
            addConnection( from, lookup[ from['convBase'] ] );
          } else {
            // prevent circulars; eg. kilogram <-> gram
            var prefBase = lookup[ from['prefixBase'] ];
            if( lookup[ prefBase['convBase'] ] != from )
            addConnection( from, prefBase );
          }

        }

      } else {
        addConnection( from, lookup[ from['refScale'] ] );
      }

    }

    // if the source node has no connections, is is a base unit
    if( lookup[ source ][ CONN ].length < 1 ) {
      return [ lookup[ source ] ];
    }


    // traverse graph to mark all reachable nodes
    var sourceNode = lookup[ source ],
        path = [],
        stack = [ sourceNode ],
        curEl, child;
    sourceNode[ MARKED ] = true;
    while( stack.length != 0 ) {

      // get top element from stack
      curEl = stack.shift();

      // mark it as processed
      curEl[ MARKED ] = true;

      // process all connections
      for( var i=0; i<curEl[ CONN ].length; i++ ) {

        // get the respective node
        child = lookup[ curEl[ CONN ][i] ]

        // only process each node once
        if( !( MARKED in child ) ) {

          // add path info
          child[ PREV ] = curEl;

          // queue element for processing
          stack.push( child );

        }

      }
    }

    // find the base unit (== no further CONNections && connection to source unit)
    var keys = Object.keys( lookup ),
        target;
    for( var i=0; i<keys.length; i++ ) {
      if(    (lookup[ keys[i] ][ CONN ].length < 1)  // not further connections
          && (lookup[ keys[i] ][ PREV ])
          ) {
        target = keys[i];
      }
    }

    // gather pathing information
    curEl = lookup[ target ];
    var path = [ curEl ],
        dir;
    while( PREV in curEl ) {

      // next element on the way
      curEl = curEl[ PREV ];

      // add to path
      path.push( curEl );

    }

    return path.reverse();
  }

  return getConversionBase;

});