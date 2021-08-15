/**
 * return a function to extract the relevant values from the dataset to be passed to the operation
 */
define( [],
function(){
  "use strict";

  /**
   * create row accessor function
   * @returns   {Function}                the accessor function
   */
  return class createRowAccessor {

    // temp object to hold the accessed values
    // valueWrapper

    /**
     * @param     {Object}         dataset    the dataset from which to extract the values
     * @param     {Array[String]}  values     list of value-names to be accessed
     * @param     {Number}         curCol     id of the base column
     */
    constructor ( dataset, values, curCol ) {

      // pointer to the primary data
      this.columns = dataset.getData();

      // add all values as properties to the wrapper
      this.valueWrapper = {};
      values.forEach( (v) => this.valueWrapper[ v ] = null );

      // build code to fill wrapper with respective values
      const code = [];
      for( let value of values ) {

        if( value == 'value' ) {

          // refer to a base column value
          code.push( `this.valueWrapper.value = this.columns[${curCol}][ row ];` );

        } else {

          // refer to some column name

          // extract column id
          const colId = parseInt( value.replace( /[^0-9]/gi, '' ), 10 );

          // add code
          code.push( `this.valueWrapper.${value} = this.columns[${colId}][ row ];` );

        }

      }

      // at the end we have to return the wrapper object
      code.push( `return this.valueWrapper;` );

      // create the respective function
      this.get = new Function( 'row', `"use strict"; ${code.join( '\n' )}` );

    }

  }

});