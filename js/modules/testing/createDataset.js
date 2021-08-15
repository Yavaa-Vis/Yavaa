"use strict";
/**
 * generate an artificial dataset
 * column description follows visualizations
 * with additional values (see respective type-classes)
 * some are shared:
 *
 * - if "isarray" is set, "multitude" gives the count of columns for that binding
 *   default: 2
 *
 * param
 *
 * columns            | Object        |   column description; see generators and vizdescriptions
 * settings           | Object        |   additional settings
 * settings.rowmode   | Enum          |   determines the mode how to generator measurements inside the rows
 *                    | 'groups'      |   for each combination of dimensions all measures are created
 *                    | 'hierarchies' |   for each combination of dimensions one measure is created
 *                    | 'random'      |   a random combination of values from all columns is created
 *                    | 'timeseries'  |   for each combination of dimensions a timeseries of measures is created
 * settings.rowcount  | Number        |   number of rows created; used only for rowmode='random'
 *
 *
 * notes
 *
 * - make sure the measurement columns contain enough values
 *   to satisfy all relevant dimension combinations
 * - measurement columns will be reset per time column value change
 *
 *
 */
define( ['basic/Constants',
         'basic/types/Dataset',
         'store/data',
         'testing/generator/NumericColumn',
         'testing/generator/SemanticColumn',
         'testing/generator/TimeColumn',
         'basic/types/Null',
], function( Constants,
             Dataset,
             Datastore,
             NumericColumn,
             SemanticColumn,
             TimeColumn,
             NullType
){

  /**
   * actual function
   */
  return async function createDataset( def ) {

    // create generator classes
    const generators = [];
    let pos = 0;  // column position
    for( let i=0; i<def.columns.length; i++ ) {

      // shortcut
      const d = def.columns[i];

      // select column generator
      const generatorPool = [];
      switch( d.datatype ) {

        case Constants.DATATYPE.NUMERIC:
        case Constants.VIZDATATYPE.QUANTITATIVE:
          generatorPool.push( NumericColumn );
          break;

        case Constants.DATATYPE.SEMANTIC:
        case Constants.VIZDATATYPE.CATEGORICAL:
          generatorPool.push( SemanticColumn );
          break;

        case Constants.DATATYPE.TIME:
        case Constants.VIZDATATYPE.TIME:
          generatorPool.push( TimeColumn );
          break;

        default:

          // combined datatypes: collect all options
          if( (d.datatype & Constants.VIZDATATYPE.CATEGORICAL)   == Constants.VIZDATATYPE.CATEGORICAL ) {
            generatorPool.push( SemanticColumn );
          }
          if( (d.datatype & Constants.VIZDATATYPE.QUANTITATIVE)  == Constants.VIZDATATYPE.QUANTITATIVE ) {
            generatorPool.push( NumericColumn );
          }
          if( (d.datatype & Constants.VIZDATATYPE.TIME)          == Constants.VIZDATATYPE.TIME ) {
            generatorPool.push( TimeColumn );
          }

      }

      // an empty pool should not occur
      if( generatorPool.length < 1 ) {
        throw Error( 'Unknown datatype: ' + d.datatype );
      }

      // single vs multiple binding-columns
      if( d.isarray ) {

        // multiple: add a sufficient number of generators at random
        const multitude = d.multitude || 2;
        for( let i=0; i<multitude; i++ ) {
          const gen = generatorPool[ Math.floor( Math.random() * generatorPool.length ) ];
          generators.push( new gen( pos, d ) );
          pos += 1;
        }

      } else {

        // single: add generator
        generators.push( new generatorPool[ Math.floor( Math.random() * generatorPool.length ) ]( pos, d ) );
        pos += 1;

      }

    }

    /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXX Metadata XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

    // set dataset-wide metadata
    const meta = {
        columns: generators.map( g => g.meta )
    };

    /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Data XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

    // select row generator scheme
    let createRow = createRowTimeseries;
    if( ('settings' in def) && def.settings && ('rowmode' in def.settings)) {
      switch( def.settings.rowmode.toLowerCase() ) {
        case 'hierarchy':   createRow = createRowHierarchy;   break;
        case 'group':       createRow = createRowGroup;       break;
        case 'random':      createRow = createRowRandom;      break;
        case 'timeseries':  createRow = createRowTimeseries;  break;
      }
    }

    // init all generators
    generators.forEach( g => g.init() );

    // split generators in dimensions and measurements
    const dimGens   = generators.map( (g) => (g.role == Constants.ROLE.DIM)  ? g : null ),
          measGens  = generators.map( (g) => (g.role == Constants.ROLE.MEAS) ? g : null );

    // collect row data
    const data = generators.map( g => [] );
    for( let row of createRow( dimGens, measGens, 0, def ) ) {

      // copy to data object's column oriented structure
      for( let i=0; i<row.length; i++ ) {
        data[i].push( row[i] );
      }

    }

    /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXX Finalize XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

    // create the dataset object
    const ds = new Dataset( meta, data );

    // debug: print the created dataset
    // showData( ds.getDataRows(), def );

    // insert into datastore
    const id = Datastore.addDataset( ds );

    return id;

  };


  /**
   * helper function to display the created dataset
   */
  function showData( d, def ) {
    console.log( `Mode: ${def.settings.rowmode}`);
    console.log( '------------------------------- DATA -----------------------------' )
    for( let row of d ) {
      console.log( row.join( '\t' ) );
    }
    console.log( '------------------------------------------------------------------' )
  }


  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Row Creators XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  /**
   * generator function to create the subsequent rows
   * timeseries edition
   */
  function* createRowTimeseries( dimGens, measGens, index ) {

    // if we are beyond all dimension generators
    if( index >= dimGens.length ) {

      // create values from all measurement generators
      const res = [];
      for( let generator of measGens ) {
        if( generator ) {
          res[ generator.getPos() ] = generator.getValue();
        }
      }

      // return as a single result
      yield res;
      return;

    }

    // shortcut
    const generator = dimGens[ index ];

    // skip measurement generators for now
    if( !generator ) {
      yield* createRowTimeseries( dimGens, measGens, index+1 );
      return;
    }

    // if this is a non Categorical column, init all measurements anew
    if( (generator instanceof TimeColumn) || (generator instanceof NumericColumn) ) {
      measGens.forEach( g => g ? g.init() : '' );
    }

    // reset the generator
    generator.reset();

    // get the values

    // traverse all values from this generator
    for( let curValue of generator.getValues() ) {

      // traverse the next level of generators
      for( let subVal of createRowTimeseries( dimGens, measGens, index+1 ) ){

        // insert the current value
        subVal[ generator.getPos() ] = curValue;

        // output
        yield subVal;

      }

    }

  }

  /**
   * generator function to create the subsequent rows
   * hierarchies edition
   */
  function* createRowHierarchy( dimGens, measGens, index ) {

    // if we are beyond all dimension generators
    if( index >= dimGens.length ) {

      // create values from all measurement generators
      const res = [];
      for( let generator of measGens ) {
        if( generator ) {

          // init the generator anew
          // TODO can probably be optimized
          generator.init();

          // insert the value
          res[ generator.getPos() ] = generator.getValue();

        }
      }

      // return as a single result
      yield res;
      return;

    }

    // shortcut
    const generator = dimGens[ index ];

    // skip measurement generators for now
    if( !generator ) {
      yield* createRowHierarchy( dimGens, measGens, index+1 );
      return;
    }

    // reset the generator
    generator.reset();

    // get the values

    // traverse all values from this generator
    for( let curValue of generator.getValues() ) {

      // traverse the next level of generators
      for( let subVal of createRowHierarchy( dimGens, measGens, index+1 ) ){

        // insert the current value
        subVal[ generator.getPos() ] = curValue;

        // output
        yield subVal;

      }

    }

  }


  /**
   * generator function to create the subsequent rows
   * group edition
   */
  function* createRowGroup( dimGens, measGens, index ) {

    // end the recursion
    if( index >= dimGens.length ) {
      yield [];
      return;
    }

    // shortcut
    const generator = dimGens[ index ] || measGens[ index ];

    // reset the generator
    generator.init();

    // get the values

    // traverse all values from this generator
    for( let curValue of generator.getValues() ) {

      // traverse the next level of generators
      for( let subVal of createRowGroup( dimGens, measGens, index+1 ) ){

        // insert the current value
        subVal[ generator.getPos() ] = curValue;

        // output
        yield subVal;

      }

    }

  }

  /**
   * generator function to create the subsequent rows
   * group edition
   */
  function* createRowRandom( dimGens, measGens, index, def ) {

    // default values
    def.settings = Object.assign({
                                  rowcount: 10,
                                }, def.settings );

    // we may need a null value
    const nullInstance = NullType();

    // should null values be included?
    const missingThreshold = def.settings && ('missing' in def.settings)
                                ? def.settings.missing
                                : 0;

    // collect getter functions
    const getter = dimGens.map( (gen,i) => {

                            // get the generator
                            gen = dimGens[i] || measGens[i];

                            // provide an accessor
                            if( gen instanceof SemanticColumn ) {
                              // semantic columns
                              return (function(gen){
                                // pool of values
                                const pool = [ ... gen.getValues() ];
                                return function(){
                                  if( Math.random() < missingThreshold ) {
                                    return nullInstance;
                                  } else {
                                    return pool[ Math.floor( Math.random() * pool.length ) ];
                                  }
                                };
                              })( gen );

                            } else {

                              // numeric/time columns
                              return (function(gen){
                                return function(){
                                  if( Math.random() < missingThreshold ) {
                                    return nullInstance;
                                  } else {
                                    return gen.getRandomValue();
                                  }
                                };
                              })( gen );

                            }

                          });

    for( let i=0; i<def.settings.rowcount; i++ ) {
      yield getter.map( g => g() );
    }

  }

});
