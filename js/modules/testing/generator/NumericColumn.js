"use strict";
/**
 * wrapper class to generate numeric test column data
 * currently only result in
 *
 * parameters
 *
 * values     {Number|Array}        number of distinct values or list of values; default: 10
 * min        {Number}              minimum number to be generated; default: 0
 * max        {Number}              maximum number to be generated; default: 100
 * change     {Number}              max. distance between two consecutive values; default: 10
 */
define( ['basic/Constants',
         'basic/types/Column',
         'basic/types/ArbNumber',
], function( Constants,
             Column,
             ArbNumber
){

  return class NumericColumn {

    /**
     * @constructor
     */
    constructor( pos, def ) {

      // store position
      this.pos = pos;

      // store definition augmented by default parameters
      this.def = Object.assign({
                    values:   10,
                    min:      0,
                    max:      100,
                    change:   10,
                  }, def);

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
        datatype: Constants.DATATYPE.NUMERIC,
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

      // create a list of values
      if( this.def.values instanceof Array ) {
        this.values = this.def.values;
      } else {

        this.values = [];

        if( this.role == Constants.ROLE.DIM ) {

          // dimensions are subsequent
          let val = 0;
          while( this.values.length < this.def.values ) {
            this.values.push( val++ );
          }

        } else {

          // measurements are chosen at random

          // first value is random
          let val = +this.getRandomValue();
          this.values.push( val );

          // fill up the remainder
          while( this.values.length < this.def.values ) {
            const change = Math.round( (2 * Math.random() - 1) * this.def.change );
            val = Math.max( this.def.min, Math.min( this.def.max, val + change ) );
            this.values.push( val );
          }

        }

      }

      // map to ArbNumber object
      this.values = this.values.map( v => ArbNumber( v ) );

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
      return ArbNumber( Math.round( Math.random() * (this.def.max - this.def.min) + this.def.min ) );
    }
  }

});