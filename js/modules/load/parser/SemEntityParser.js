"use strict";
/**
 * returns a factory for creating a custom SemInstance object
 */
define( [ 'basic/types/SemEntity' ],
function(       SemEntity          ){

  function Factory( codelist ) {

    // create constructor
    const SemInstance = function SemInstance( val ){

      // check type of call
      if( !new.target ) {

        // factory method

        // check, if we already have a matching entry
        if( val in SemInstance._codeList ) {

          // we already have a matching entry, so use that one
          return SemInstance._codeList[ val ];

        } else {

          // create a new entry
          return new SemInstance( val );

        }

      } else {

        // constructor method

        // set the value
        this._val = val;

        // add to lookup
        SemInstance._codeList[ val ] = SemInstance._codeList[ val ] || this;

      }

    };

    // set prototype to SemEntity
    SemInstance.prototype = Object.create( SemEntity.prototype );

    // set constructor
    SemInstance.prototype.constructor = SemInstance;

    // set some static properties
    Object.defineProperty( SemInstance, "_codeListURI",   { value: codelist,                  writable: false } );
    Object.defineProperty( SemInstance, "_codeList",      { value: {},                        writable: false } );
    Object.defineProperty( SemInstance, "resolveEntities",{ value: SemEntity.resolveEntities, writable: false } );
    Object.defineProperty( SemInstance, "resolveURIs",    { value: SemEntity.resolveURIs,     writable: false } );

    // toString
//    SemInstance.prototype.toString = function(){
//      return SemInstance._codeList[ this._val ] || this._val;
//    };
//    SemInstance.prototype.toJSON = SemInstance.prototype.toString;

    return SemInstance;
  }

  return Factory;
});