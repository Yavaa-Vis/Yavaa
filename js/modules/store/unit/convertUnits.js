"use strict";
/**
 * conversion between two units
 *
 * not applicable to VirtualUnits
 */
define( [  'basic/types/Unit',
           'util/flatten.sparql',
           'comp/function/parseFormula',
           'comp/function/parseFormula/Constants',
           'comp/function/createFunction',
           'text!template/query/unit/convertUnits.rq',
           'text!template/query/unit/convertScales.rq',
           'text!template/query/unit/findConversionPath.rq',
 ], function(
           Unit,
           flattenResult,
           parseFormula,
           parseFormulaConst,
           createFunction,
           queryConvertUnits,
           queryConvertScales,
           queryFindConversionPath
){

  /**
   * convert from unit <from> to unit <to>
   * @param   {Unit}      from    the unit to convert from
   * @param   {Unit}      to      the unit to convert to
   * @param   {Number}    format  the requested output format
   * @param   {Boolean}   inverse the conversion is requested for denominators (1/u => 1/v)
   * @returns {Object|Function}
   */
  async function convertUnits( from, to, format, inverse ) {

    // default for inverse is false
    inverse = inverse || false;

    // make sure units are units
    if( !(from instanceof Unit) || !(to instanceof Unit)){
      throw new Error( 'Parameter for convertUnits is not a unit!' );
    }

    let units,
        source = [
          { 'value': from.getURI(), 'type': 'uri' },
          { 'value': to.getURI(),   'type': 'uri' }
        ];

    // get the path used for the conversion
    return this._client.query( queryFindConversionPath,{
                    'units': source
                  })
                  .then( ( d ) => {

                    // add found units to source
                    for( var i=0; i<d.length; i++ ) {
                      source.push({
                        'value': d[i]['unit']['value'],
                        'type': 'uri'
                      });
                    }

                    // query for all involved conversions
                    return this._client.query( queryConvertUnits,{
                      'units': source
                    });

                  })
                  .then( ( d ) => {

                    // flatten result
                    units = flattenResult( d );

                    // do we need to convert scales too?
                    if( ('scale' in units[0]) && (units[0]['scale'] != units[1]['scale'] ) ) {

                      return this._client.query( queryConvertScales,{
                        'scales':[
                          { 'value': units[0]['scale'], 'type': 'uri' },
                          { 'value': units[1]['scale'], 'type': 'uri' }
                        ]
                      });

                    }

                  })
                  .then( async ( scales ) => {

                    // following code assumes, that there are no circular conversion paths!

                    // flatten scales
                    if( scales ) {
                      scales = flattenResult( scales );
                    } else {
                      scales = [];
                    }

                    // find path
                    const path = getConvPath( units.concat( scales ), from.getURI(), to.getURI() );

                    // validate, that start and end of the path are actually our units
                    // otherwise we can not find a conversion and have to finish with error
                    if( (path[0].node.unit != from.getURI()) || (path[ path.length-1 ].node.unit != to.getURI()) ) {
                      throw new Error( `Can not convert from <${from.getURI()}> to <${to.getURI()}>!` );
                    }

                    // convert path to an (unlabeled) AST
                    var root = { value: 'value' },
                        scaled = false;       // scaled conversion?
                    for( var i=0; i<path.length-1; i++ ){

                      // unit -> unit
                      if( path[i]['node']['isUnit'] && path[i+1]['node']['isUnit'] ) {

                        // shortcuts
                        var isOut = path[i]['isOut'],
                            chooseOp = inverse ? !isOut : isOut;

                        // determine element to use
                        var elInd = isOut ? i : i+1;

                        // add conversion factor, if necessary
                        if( path[elInd]['node']['convFactor'] != 1 ) {
                          root = {
                              value:    chooseOp ? '*' : '/',
                              children: [ root, { value: path[elInd]['node']['convFactor'] } ]
                          };
                        }

                        // add prefixfactor, if necessary
                        if( path[elInd]['node']['prefixFactor'] != 1 ) {
                          root = {
                              value:    chooseOp ? '*' : '/',
                              children: [ root, { value: path[elInd]['node']['prefixFactor'] } ]
                          };
                        }

                      }

                      // scale -> scale
                      if( !path[i]['node']['isUnit'] && !path[i+1]['node']['isUnit'] ) {

                        // orientation in scale-conversion is opposite to that in unit-conversion ...
                        if( path[i]['isOut'] ) {

                          if( path[i]['node']['convOffset'] != 0 ) {
                            root = {
                                value:    '-',
                                children: [ root, { value: path[i]['node']['convOffset'] } ]
                            };
                          }
                          if( path[i+1]['node']['convFactor'] != 1 ) {
                            root = {
                                value:    '/',
                                children: [ root, { value: path[i]['node']['convFactor'] } ]
                            };
                          }

                        } else {

                          if( path[i+1]['node']['convFactor'] != 1 ) {
                            root = {
                                value:    '*',
                                children: [ root, { value: path[i+1]['node']['convFactor'] } ]
                            };
                          }
                          if( path[i]['node']['convOffset'] != 0 ) {
                            root = {
                                value:    '+',
                                children: [ root, { value: path[i+1]['node']['convOffset'] } ]
                            };
                          }

                        }

                        // remember, this was a scaled conversion
                        scaled = true;
                      }

                      // scale -> unit; unit -> scale
                      // noop

                    }

                    // scaled, inverted conversion have to be taken care of separately
                    if( scaled && inverse ) {
                      root = {
                          value:    '/',
                          children: [ { value: '1' }, root ]
                      };
                    }

                    // run formula through formula parser
                    var fktData = await parseFormula( parseFormulaConst.IN_AST, format || null, root );

                    // we want to pipe NULL values through
                    fktData.pipeNull = true;

                    // and make it an actual JS function, if needed
                    if( !format || (format == parseFormulaConst.OUT_FUNCTION) ) {
                      var fkt = await createFunction( fktData );
                      return fkt;
                    } else {
                      return fktData;
                    }

                  });
  }



  /**
   * traverse the graph given by nodes and return a path from source to target
   */
  function getConvPath( nodes, source, target ) {

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


    // add CONNection only, if there is a valid endpoint
    function addConnection( from, to ) {
      if( to && ( to != from )) {
        from[ CONN ].push({
          'target': to[ ID ],
          'isOut': true
        });

        to[ CONN ].push({
          'target': from[ ID ],
          'isOut': false
        });
      }
    }


    // build graph
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
            addConnection( from, lookup[ from['prefixBase'] ] );
          }

        }

      } else {
        addConnection( from, lookup[ from['refScale'] ] );
      }

    }

    // traverse graph to find a path
    var sourceNode = lookup[ source ],
        targetNode = lookup[ target ],
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
        child = lookup[ curEl[ CONN ][i]['target'] ]

        // only process each node once
        if( !( MARKED in child ) ) {

          // add path info
          child[ PREV ] = {
              'el': curEl,
              'isOut': curEl[ CONN ][i]['isOut']
          };

          // queue element for processing
          stack.push( child );

        }

      }
    }

    // gather pathing information
    curEl = lookup[ target ];
    var path = [{
                'node': curEl,
                'isOut':  curEl['isOut']
              }],
        dir;
    while( PREV in curEl ) {

      // next element on the way
      dir   = curEl[ PREV ]['isOut'];
      curEl = curEl[ PREV ]['el'];

      // add to path
      path.push({
        'node': curEl,
        'isOut':  dir
      });

    }

    return path.reverse();
  }


  return convertUnits;
})