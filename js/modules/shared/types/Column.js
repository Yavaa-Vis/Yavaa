"use strict";
/**
 * Wrapper for column meta data
 * shared Methods between Server and Client
 *
 * valid meta data structure:
 * {
 *  label: 'String'       // label
 *  concept: 'String'     // concept of the column
 *  coded: 'String'       // coded property?
 *  type: 'String'        // dimension or measurement
 *  order: 'String'       // position in the datasource
 *  codelist: 'String'    // (optional) URL of the codelist
 *  datatype: 'String'    // datatype
 *  values: {
 *    'list': [Array]         // list of values for semantic
 *    'min':  Number/String   // minimum value for time/number
 *    'max':  Number/String   // maximum value for time/number
 *  },
 *  constr : [Function]   // constructor for elements in this colum
 *  unit:   'basic/types/Unit' // (optional) unit of this column
 * }
 */
define( [ 'basic/Constants',
          'shared/types/Unit' ],
function( Constants,
          Unit ){

  /**
   * @constructor
   */
  function Column( ds, pos, meta ){
    // TODO input validation

    // reference to the dataset
    this._setVal( '_ds',    ds );

    // init attributes
    this._setVal( '_attr',  {} );

    // two ways of passing the meta data
    if( typeof pos == 'number' ) {

      // format: position, meta
      this._setVal( '_meta',  meta );
      this._setVal( '_pos',   pos );

    } else {

      // we got a serialized column object

      // shortcut for better readability
      meta = pos;
      pos = meta._pos;

      // store properties
      this._setVal( '_meta',  meta );
      this._setVal( '_pos',   pos );

      // copy all attribute values
      if( '_attr' in meta ) {
        var keys = Object.keys( meta['_attr'] );
        for( var i=0; i<keys.length; i++ ) {
          this['_attr'][ keys[i] ] = meta['_attr'][ keys[i] ];
        }
        delete meta['_attr'];
      }

    }

    // if datatype is not set, determine from constructor
    if( !('datatype' in this['_meta']) && ('constr' in this['_meta']) ) {
      switch( this['_meta']['constr'].prototype['_type'] ) {

        case 'ArbNumber':   this['_meta']['datatype'] = Constants.DATATYPE.NUMERIC;  break;
        case 'Bag':         this['_meta']['datatype'] = Constants.DATATYPE.BAG;      break;
        case 'SemEntity':   this['_meta']['datatype'] = Constants.DATATYPE.SEMANTIC; break;
        case 'String':      this['_meta']['datatype'] = Constants.DATATYPE.STRING;   break;
        case 'TimeInstant': this['_meta']['datatype'] = Constants.DATATYPE.TIME;     break;

      }
    }

    // create Unit object, if property is present
    if( ('unit' in meta) && meta.unit ) {
      this.setUnit( this._meta.unit );
      // this._meta.unit = Unit.create( this._meta.unit );
    }

  }


  /**
   * set a particular key/value pair for this object
   * - not modifiable
   */
  Column.prototype._setVal = function( name, val ) {
    Object.defineProperty( this, name, {
      'value': val, 'writable': true
    });
  };

  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Simple Getter XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  /**
   * return the concept related to this column
   */
  Column.prototype.getConcept = function(){
    return this['_meta']['concept'] || null;
  };


  /**
   * get the datatype of this column. one of the following values (set in basic/Constants):
   * - semantic
   * - numeric
   * - time
   * - string
   * - bag
   * @returns {String}
   */
  Column.prototype.getDatatype = function getDatatype(){
    return this['_meta']['datatype'] || null;
  }


  /**
   * get the column id for operations
   * @returns {Number}
   */
  Column.prototype.getID = function getID(){
    // TODO make sure this is the actual column position
    return this['_pos'];
  }


  /**
   * get the label for this column
   * @return {String}
   */
  Column.prototype.getLabel = function getLabel(){
    return this['_meta']['label'];
  }


  /**
   * get the position of this column with respect to the other columns
   * @returns {Number}
   */
  Column.prototype.getPosition = function getPosition(){
    return this['_pos'];
  }


  /**
   * get the codelist URI for this column
   * returns null, if column-type is not semantic
   * @returns {String|null}
   */
  Column.prototype.getCodelist = function getCodelist() {
    if( this.getDatatype() == 'semantic' ) {
      return this._meta.constr._codeListURI;
    } else {
      return null;
    }
  }


  /**
   * get the constructor used for this column
   * @returns {String|null}
   */
  Column.prototype.getConstructor = function getConstructor() {
    return this._meta.constr;
  }


  /**
   * get the source column of this one, if existing
   * @returns {Column|null}
   */
  Column.prototype.getSource = function getSource() {
    return this._source;
  }


  /**
   * get the the unit used for this column
   * will return null, if no unit is known or the columns is not numeric
   * @returns {String|null}
   */
  Column.prototype.getUnit = function getUnit() {
    return this._meta.unit;
  }

  /**
   * get the role of this column
   * @returns {String|null}
   */
  Column.prototype.getRole = function getRole(){
    return this['_meta']['role'];
  };

  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Simple Setter XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  /**
   * set the unit of this column
   * this is the default, client-side, version
   * server-side version will be overridden
   */
  Column.prototype.setUnit = function setUnit( src ) {
    if( src === null ) {
      this._meta.unit = null;
    } else if( src instanceof Unit ) {
      this._meta.unit = src;
    } else {
      this._meta.unit = new Unit( src );
    }
  }


  /**
   * set the immediate ancestor/source for this column
   */
  Column.prototype.setSource = function( source ) {

    // store reference to source (server-side)
    this._setVal( '_source', source );

    // store position id of source (client-side)
    this._attr[ '_sourcePos' ] = source.getID();

  }


  /**
   * set the label for this column
   * @param {String}  label   the new label
   */
  Column.prototype.setLabel = function( label ){
    this['_meta']['label'] = label;
  }


  /**
   * set the position of this column with respect to the other columns
   * @param {Number}  pos   the new position
   */
  Column.prototype.setPosition = function( pos ){
    this['_pos'] = pos;
  }


  /**
   * set the concept for this column
   * @param {String}  concept   the new concept
   */
  Column.prototype.setConcept = function setConcept( concept ){
    this['_meta']['concept'] = concept;
  }

  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Advanced Getter XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  /**
   * check, whether the current Column object is a descendant from ancestor
   * @param   {Column}    ancestor    the ancestor
   * @param   {Number}    maxGen      maximum generations to check
   * @returns {Boolean}
   */
  Column.prototype.isDescendant = function( ancestor, maxGen ) {

    // no lineage
    if( !('_source' in this) ) {
      return false;
    }

    // default value for maxGen: just check immediate parent
    maxGen = maxGen ? +maxGen : 1;

    // check lineage
    var parent = this['_source'],
        gen = 0;
    while( parent && (gen < maxGen) ) {

      // did we find something?
      if( parent === ancestor ) {
        return true;
      }

      // next generation
      gen += 1;
      parent = parent['_source'];
    }

    // found nothing, so false
    return false
  }

  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Attributes XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  Column.prototype.getAttribute = function getAttribute( key ){
    if( key in this['_attr'] ) {
      return this['_attr'][key];
    } else {
      return null;
    }
  }

  Column.prototype.setAttribute = function setAttribute( key, val ) {
    this['_attr'][ key ] = val;
  }

  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Simple Exists XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  /**
   * is this column a dimension?
   * @returns {Boolean}
   */
  Column.prototype.isDimension = function(){
    return this['_meta']['role'] == Constants.ROLE.DIM;
  };

  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Cloning XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  /**
   * create a clone of this Column object
   * @param {Number*}    (optional) position of the column within the dataset, if it has changed
   */
  Column.prototype.clone = function( pos, isNewCol ){

    // serialize this object
    var ser = this.toJSON();

    // change position, if needed
    if( typeof pos == 'number' ) {
      ser['_pos'] = pos;
    }

    // add constructor, if existing
    if( 'constr' in this._meta ) {
      ser.constr = this._meta.constr;
    }

    // clone the object
    var col = new Column( this['_ds'], ser );

    // set lineage, if this is not a new column
    if( !isNewCol ) {
      col.setSource( this );
    }

    // return
    return col;

  }

  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Serializing XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  /**
   * serialize this object to JSON
   */
  Column.prototype.toJSON = function(){

    // include just some information
    return {
      '_pos':     this.getID(),
      'datatype': this.getDatatype(),
      'label':    this.getLabel(),
      'concept':  this.getConcept(),
      'role':     this['_meta']['role'],
      '_attr':    this['_attr'],
      'unit':     this.getUnit(),
    };

  }

  // toString and toJSON are the same here
  Column.prototype.toString = function(){
    return '[Column: ' + this.getLabel() + ']';
  }
  // for Node.js we need to overwrite another method for debug output
  Column.prototype.inspect = Column.prototype.toString;


  // export
  return Column;
});