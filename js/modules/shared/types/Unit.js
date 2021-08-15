"use strict";
/**
 * Wrapper for unit related data
 * shared methods between Server and Client
 *
 * {
 *  label:        'String'          // label
 *  concept:      'String'          // concept of the column
 *  symbol:       'String'          // symbol used for this unit
 *  dimension:    'String'          // dimension of the unit
 *  dimVector:    'Array[number]'   // dimension vector for this unit
 * }
 */
define( [],
function(){

  /**
   * @constructor
   */
  function Unit( param ) {

    if( typeof param == 'string' ) {

      // we got a URI identifier
      this._setVal( '_uri' , param );

    } else {

      if( 'uri' in param ) {

        // we got a plain unit description
        this._setVal( '_uri' ,    param.uri );
        this._setVal( '_label' ,  param.label );

      } else {

        // we got a virtual unit description
        const labelN = param.n.map( (u) => u.label ).join( ' * ' ),
              labelD = param.d.map( (u) => u.label ).join( ' * ' ),
              label  = !labelD ? labelN
                               : ( (param.n.length > 1 ? `(${labelN})` : labelN)
                                   + ' per '
                                   + (param.d.length > 1 ? `(${labelD})` : labelD)
                                 ),
              uri    = param.n.map( (u) => u.uri ).join( '|' )
                       + '|/|'
                       + param.d.map( (u) => u.uri ).join( '|' );

        this._setVal( '_uri' ,    uri );
        this._setVal( '_label' ,  label );
      }

    }

  }


  /**
   * set a particular key/value pair for this object
   * - not modifiable
   */
  Unit.prototype._setVal = function( name, val, enumerable ) {
    Object.defineProperty( this, name, {
      'value': val,
      'enumerable': !!enumerable
    });
  };


  /**
   * return the URI
   */
  Unit.prototype.getURI = function getURI() {
    return this._uri;
  }


  /**
   * return the label of this unit
   */
  Unit.prototype.getLabel = function getLabel() {
    return this._label;
  }


  /**
   *  overwrite clone handler to ensure there are no duplicates for the same unit
   */
  Unit.prototype.clone = function clone(){
    return this;
  }


  /**
   * serialize the given unit to JSON
   */
  Unit.prototype.toJSON = function toJSON(){
    return {
      uri:    this.getURI(),
      label:  this.getLabel()
    };
  };

  /**
   * remember the type of the object
   */
  Unit.prototype._type = 'Unit';

  // export
  return Unit;

});