"use strict";
/**
 * internal representation of a dataset
 *
 * valid meta data structure for constructing dataset:
 * {
 *    metadata: {           // metadata of the whole dataset
 *      title:
 *      publisher:
 *    },
 *    distr: [              // available distributions for this data set or empty if uploaded/created data
 *      {
 *        type:               // MIME type
 *        url:                // url, where to retrieve
 *        id:                 // id within our store
 *      }
 *    ],
 *    distrUsed :           // one of the entries from distr, which actually got used
 *    columns: [            // columns present in this dataset
 *      [Object Column]       // instances of column wrapper
 *    ]
 *
 * }
 */
define( [ 'basic/types/Column',
          'basic/types/BaseDataset' ],
function( Column,
          BaseDataset ){

  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Constructor XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  var reqAttr = {
      metadata: [ 'title', 'publisher' ],
      distr:    [ 'type', 'url', 'id' ]
  };

  /**
   * @constructor
   * @param {Object}  desc    dataset description or Dataset instance to copy from
   * @param {Array}   cols    array of column objects, if changed from the source dataset
   * @param {Array}   data    actual data
   */
  function Dataset( desc, cols, data ){

    // sort the variables
    if( !data ) {
      data = cols;
      cols = null;
    }

    // attach actual data
    this['data'] = data;

    // prepare meta data
    this['meta'] = {
      'columns': [],
      'cols': [],     // TODO this probably can be removed; otherwise docu the difference to "columns"
      'dataset': {}
    };

    // attach metadata
    if( desc instanceof Dataset) {

      // copy the meta data from the old dataset
      this['meta'] = desc.getMetaCopy();

      // remove the distribution related entries
      delete this['meta']['distr'];
      delete this['meta']['distrUsed'];

    } else {

      // check existence of desc object
      if( typeof desc !== 'object' ) {
        throw new Error( 'Could not read dataset description' );
      }

      // copy dataset wide metadata
      var keys = reqAttr.metadata;
      if( 'metadata' in desc ) {
        for( var i=0; i<keys.length; i++ ) {
          this['meta']['dataset'][ keys[i] ] = desc['metadata'][ keys[i] ] || null;
        }
      } else {
        for( var i=0; i<keys.length; i++ ) {
          this['meta']['dataset'][ keys[i] ] = null;
        }
      }

      // copy distributions
      if( ('distr' in desc) && (desc['distr'] != null ) ) {

        // available distributions
        this['meta']['distr'] = desc['distr'];

        // used distribution
        if( 'distrUsed' in desc ) {

          this['meta']['distrUsed'] = desc['distrUsed'];

        } else {

          throw new Error( 'Missing used distribution in dataset description' );

        }

      } else {

        // no distribution available => uploaded data
        this['meta']['distr'] = [];
        this['meta']['distrUsed'] = null;

      }

      // columns may be different depending on source
      if( 'columns' in desc ) {

        // parse column meta data into respective objects
        let colDesc = desc['columns'],
            newCol;
        for( var i=0; i<colDesc.length; i++ ) {

          // create column object
          if( colDesc[i] instanceof Column ) {
            newCol = colDesc[i].clone( i, false );
          } else {
            newCol = new Column( this, i, colDesc[i] );
          }

          // add to metadata
          this['meta']['columns'].push( newCol );

        }

      }

    }

    // set column array, if given
    if( cols ) {
      this['meta']['columns'] = cols.slice( 0 );
    }

    // we need to have some column description
    if( !('columns' in this['meta']) || (this['meta']['columns'].length < 1) ) {
      // no column description ...
      throw new Error( 'Could not read column information from dataset description' );
    }

    // make sure that meta desc and data are compatible
    if( this['meta']['columns'].length != this['data'].length ){
      throw new Error( 'Metadata and data do not match up!' );
    }
  }

  // inherit from BaseDataset
  Dataset.prototype = new BaseDataset();
  Dataset.prototype.constructor = Dataset;


  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX populate() XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  /**
   * populate meta properties, if necessary
   * - units
   */
  Dataset.prototype.populateMeta = function populateMeta(){

    // get unique units
    let units = new Set();
    this
      .meta
      .columns
      .forEach( (col) => units.add( col.getUnit() ) );
    units.delete() // remove "undefined" from set

    // resolve units
    if( units.size > 0 ){
      return new Promise( (fulfill, reject) => {
        require( ['store/unit'], (UnitStore) => {

          UnitStore.populateUnits( units )
            .then( fulfill )
            .catch( reject );

        });
      });
    } else {
      return true;
    }

  }

  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX getRow XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  Dataset.prototype['getRow'] = function( row ){
    var rows = this['getPartialData']( row, 1 );
    if( rows.length > 0 ) {
      return rows[0];
    } else {
      return [];
    }

  };

  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX getRowCount XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  Dataset.prototype['getRowCount'] = function(){
    return this.data[0].length;
  };

  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX change columns XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  Dataset.prototype['addColumn'] = function( meta, data ) {

    // new columns are just appended to the end
    meta.setPosition( this.getColCount() );

    // add meta and data
    this.meta.columns.push( meta );
    this.data.push( data );

  }


  /**
   * replace a particular column in the dataset
   */
  Dataset.prototype['replaceColumn'] = function( id, data, meta ) {
    this.data[ id ] = data;
    this.meta.columns[ id ] = meta;
  }


  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX getPartialData XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  /**
   * return a subset of the rows stored in this dataset
   */
  Dataset.prototype['getPartialData'] = function( start, entries ){

    // local variables
    const res = [];
    let line;

    // get maximum index of retrieved item; length of data array is upper border
    const max = Math.min( this.data[0].length, start+entries );

    // prepare data
    for( let i=start; i<max; i++ ) {

      line = [];

      for( let j=0; j<this.data.length; j++ ) {
        line.push( this.data[j][i] );
      }

      res.push( line );
    }

    return res;
  };

  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Export XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  return Dataset;

});