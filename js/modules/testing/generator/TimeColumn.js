"use strict";
/**
 * wrapper class to generate time test column data
 * values only allows ISO compliant strings up to days
 *
 * parameters
 *
 * values     {Number|Array}        number of distinct values or list of values; default: 10
 * start      {Date}                start time; default: 2000-01-01
 * format     {Enum}                time format - one of YEARLY, MONTHLY, DAILY; default: YEARLY
 *
 */
define( ['basic/Constants',
         'basic/types/Column',
         'load/parser/SimpleDateParser',
], function( Constants,
             Column,
             SimpleDateParser
){

  return class TimeColumn {

    /**
     * @constructor
     */
    constructor( pos, def ) {

      // store position
      this.pos = pos;

      // store definition augmented by default parameters
      this.def = Object.assign({
                    values:   10,
                    start:    new Date("2000-01-01"),
                    format:   TimeColumn.YEARLY,
                  }, def);

      // determine regexp and meanings to use
      const regexp = /(\d{4})-([01]?\d)-([0-3]?\d)/;
      let meaning = [];
      switch( this.def.format ) {
        case TimeColumn.DAILY:    meaning.unshift( 'day' );
        case TimeColumn.MONTHLY:  meaning.unshift( 'month' );
        case TimeColumn.YEARLY:   meaning.unshift( 'fullyear' );
          break;
        default: throw new Error( 'Unknown format!' );
      }

      // initialize parser object
      // parameters: pattern, meanings
      this.parser = SimpleDateParser( regexp, meaning );

    }

    /**
     * get the role of this column
     */
    get role() {
      return this.def.role;
    }

    /**
     * Enum values
     */
    static get YEARLY()  { return 1 << 0; }
    static get MONTHLY() { return 1 << 1; }
    static get DAILY()   { return 1 << 2; }

    /**
     * create a serialized column metadata object
     */
    get meta(){
      return {
        _pos:     this.pos,
        datatype: Constants.DATATYPE.TIME,
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

      // list of values
      if( this.def.values instanceof Array ) {
        this.values = this.def.values;
      } else {
        this.values = [];
        let runner = new Date( this.def.start );
        for( let i=0; i<this.def.values; i++ ) {

          // insert ISO compliant string
          this.values.push( runner.toISOString() );

          // increment for next run
          switch( this.def.format ) {
            case TimeColumn.DAILY:    runner.setDate( runner.getDate() + 1 );         break;
            case TimeColumn.MONTHLY:  runner.getMonth( runner.getMonth() + 1 );       break;
            case TimeColumn.YEARLY:   runner.setFullYear( runner.getFullYear() + 1 ); break;
            default: throw new Error( 'Unknown format!' );
          }
        }
      }

      // map to TimeInstant objects
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

});