"use strict";
/**
 * wrapper class to generate semantic test column data
 *
 * parameters
 *
 * values     {Number|Array}        number of distinct values or list of values; default: 10
 * codelist   {String}              URI of referenced codelist
 *
 */
define( ['basic/Constants',
         'basic/types/Column',
         'load/parser/SemEntityParser',
], function( Constants,
             Column,
             SemEntityParser
){

  return class SemanticColumn {

    /**
     * @constructor
     */
    constructor( pos, def ) {

      // store position
      this.pos = pos;

      // store definition augmented by default parameters
      this.def = Object.assign({
                    codelist: 'http://yavaa.org/ns/dummyCodelist',
                    values:   10,
                  }, def);

      // initialize parser object
      // parameter: URL of the codelist is not mocked yet
      // (e.g., resolve wont work)
      this.parser = SemEntityParser( this.def.codelist );

    }

    /**
     * get the role of this column
     */
    get role() {
      return this.def.role;
    }

    /**
     * create a serialized column metadata object
     */
    get meta(){
      return {
        _pos:     this.pos,
        datatype: Constants.DATATYPE.SEMANTIC,
        label:    this.def.desc,
        concept:  this.def.desc,
        role:     this.def.role,
        _attr:    {},
        unit:     null,
       };
    }

    /**
     * initialize this object
     * in particular this will change the values generated
     */
    init(){

      // create a list of distinct values
      if( this.def.values instanceof Array ) {
        this.values = this.def.values;
      } else {
        this.values = [];
        for( let i=0; i<this.def.values; i++ ) {
          this.values.push( numberToString( i ) );
        }
      }

      // parse values
      this.values = this.values.map( v => this.parser( v ) );

      // reset the remaining variables
      this.reset();

    }

    /**
     * reset the classes output
     */
    reset() {
      this.currentElement = 0;
    }

    /**
     * generator function for the values
     */
    * getValues() {
      while( this.currentElement < this.values.length ) {
        yield this.values[ this.currentElement ];
        this.currentElement += 1;
      }
    }

    /**
     * get a single value
     */
    getValue(){
      return this.values[ this.currentElement++ ];
    }

    /**
     * get the position of this column
     */
    getPos() {
      return this.pos;
    }

    /**
     * get a single random value of the given range
     */
    getRandomValue() {
      return this.values[ Math.floor( Math.random() * this.values.length ) ];
    }

  }

  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Helper XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  /**
   * convert number to a string
   * list starts with A to Z, then AA etc
   */
  function numberToString( n ) {

    // split into digits
    const d = [];
    do {
      d.push( n % 26 );
      n = Math.trunc( n / 26 );
    } while( n > 0 );

    // create string
    return d.map( c => String.fromCharCode( 65 + c ) ).join( '' );
  }

});