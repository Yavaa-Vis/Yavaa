"use strict";

define( function(){

  const trailZeros = [ 1, 1000000, 100000, 10000, 1000, 100, 10, 1];


  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */
  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX EXTERNAL DEFINITIONS XXXXXXXXXXXXXXXXXXXXXXXXXX */
  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  const ArbNumber = function ArbNumber( arg, radix ) {

    if( new.target ) {

      // called as constructor, so proceed
      const parsed = __parse( ''+arg, radix );

      Object.defineProperty( this, "__digits",      { value: parsed.digits.slice(0),   writable: true } );
      Object.defineProperty( this, "__offset",      { value: parsed.offset,            writable: true } );
      Object.defineProperty( this, "__isPositive",  { value: parsed.isPositive,        writable: true } );

      __cleanup( this, true );

    } else {

      // called as function, so we have to call the constructor
      return new ArbNumber( arg, radix );

    }

  };

  ArbNumber.prototype['add']     = __realadd;
  ArbNumber.prototype['sub']     = __realsub;
  ArbNumber.prototype['inverse'] = function( precision ){ __inverse( this, precision ); return this; };
  ArbNumber.prototype['mul']     = function( other ){ __mul( this, other ); return this; };
  ArbNumber.prototype['div']     = function( other, precision ){ __div( this, other, precision ); return this; };
  ArbNumber.prototype['compare'] = function( other ){ return __comp( this, other ); };
  ArbNumber.prototype['round']   = __round;
  ArbNumber.prototype['clone']   = __clone;
  ArbNumber.prototype['toString'] = __toString;
  ArbNumber.prototype['toJSON']  = __toString;
  ArbNumber.prototype['hash']    = __toString;
  ArbNumber.prototype['_type']   = 'ArbNumber';

  // add a custom inspect, if we are in a NodeJS environment
  // https://nodejs.org/api/util.html#util_custom_inspection_functions_on_objects
  if( (typeof process === 'object')
      && (typeof process.versions === 'object')
      && (typeof process.versions.node !== 'undefined') ) {
    const Util = require( 'util' );
    ArbNumber.prototype[ Util.inspect.custom ] = __toString;
  }


  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */
  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXX SETTINGS XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */
  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */


  // regexp to remove anything, that does match our number expectations
  const regexpFormat = /([+-]?\d+([.,]\d+)?([eE]-?\d+)?)/g;

  /* internal variables */
  const cfg = {
    separator: '.',
    scientific: 'E',
    overflow: 10000000,  overflowLength: 7,  // FLOOR( SQRT( max int ) )
  //   overflow: 10, overflowLength: 1,

    defaultPrecision: 3,

  };
  cfg.one = new ArbNumber( 1, 10 );
  cfg.zero = new ArbNumber( 0, 10 );


  /* computed internal variables */
  cfg.roundingCutoff = cfg.overflow / 2;

  // padding zeros
  const paddingZeros = [ '' ];
  for( let i=1; i<=cfg.overflowLength; i++ ) {
    paddingZeros.push( paddingZeros[ paddingZeros.length - 1 ] + '0' );
  }



  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */
  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXX PARSING AND OBJECT CREATION XXXXXXXXXXXXXXXXXXXX */
  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

   /**
   * @param {string} arg
   * @param {number=} radix
   */
  function __parse( arg, radix ) {
    // TODO radix support
    // TODO cleverer use of scientific notation
    // TODO in theory the __offset is limited, but there should be no relevance in practice

    radix = radix || 10;
    let result = {
        digits: [],       // digits
        offset: 0,        // powers of overflow, which this number is "translated" to
        isPositive: true    // sign: true === positive, false === negative
    };

    // extract the number part, we can cope with
    const cleanArg = arg.match( regexpFormat );
    arg = cleanArg[0];

    // digits per array field
  //    let dig = Math.floor( Math.log(cfg.overflow) / Math.log(parseInt( radix )) ) + 2;
    let dig = cfg.overflowLength;

    // any sign given?
    if ( '-' === arg.charAt( 0 ) ) {

      // starting with a '-', so its a negative number
      result.isPositive = false;
      arg = arg.slice( 1 );

    } else if ( '+' === arg.charAt( 0 ) ) {

      // starting with a '+', just remove it
      arg = arg.slice( 1 );

    }

    // split by decimal point and scientific exponent
    let parts = [];
    arg = arg.toUpperCase();
    let sepIndex1 = arg.indexOf( cfg.scientific );
    if ( sepIndex1 > -1 ) {
      parts[ 2 ] = arg.substring( sepIndex1 + 1 );
    } else {
      sepIndex1 = undefined;
    }
    let sepIndex2 = arg.indexOf( cfg.separator );
    if ( sepIndex2 > -1 ) {
      parts[ 0 ] = arg.substring( 0, sepIndex2 ) || '0';
      parts[ 1 ] = arg.substring( sepIndex2+1, sepIndex1 );
    } else {
      parts[ 0 ] = arg.substring( 0, sepIndex1 );
      parts[ 1 ] = '';
    }

    // if there is a scientific notation present, adjust the other digits
    let scientificOffset = 0;
    if( parts[2] ) {

      // compute the offset in multiples of box size for digits
      scientificOffset = +parts[2];
      let smod = scientificOffset % dig;
      scientificOffset = Math.trunc( scientificOffset / dig );

      // adjust the digits before and after the decimal point according to the modulo
      if( smod > 0 ) {

        // make sure there are enough digits
        if( parts[1].length < smod ) {
          parts[1] += paddingZeros[ smod - parts[1].length + 1 ];
        }

        // copy accordingly
        parts[0] = parts[0] + parts[1].slice( 0, smod );
        parts[1] = parts[1].slice( smod );

      }
      if( smod < 0 ) {

        // get the absolute value for shifting
        smod = -smod;

        // make sure there are enough digits
        if( parts[0].length <= smod ) {
          parts[0] = paddingZeros[ smod - parts[0].length + 1 ] + parts[0];
        }

        // copy accordingly
        parts[1] = parts[0].slice( -smod ) + parts[1];
        parts[0] = parts[0].slice( 0, smod );

      }

    }

    // get digits to the left of decimal point digits
    let start = parts[0].length,
        end;
    while( start > 0 ) {
      end = start;
      start = start > dig ? start - dig : 0;
      result.digits.push( parseInt( parts[0].substring( start, end ), radix ) );
    }
    result.digits.reverse();


    result.offset = result.digits.length;
    if ( result.offset > 0 ) {
      result.offset -= 1;
    }
    result.offset += scientificOffset;

    // get digits to the right of decimal point digits
    if ( parts[1] ) {

      sepIndex1 = parts[1].length;

      start = 0;
        end = start + dig;
      while( end < sepIndex1 ) {
        result.digits.push( parseInt( parts[1].substring( start, end ), radix ) );

        start  += dig;
        end += dig;
      }

      // process the last digits separatly, because it doesn't have enough digits
      parts[1] = parts[1].substring( start );
      result.digits.push( parseInt( parts[1], radix ) * trailZeros[ parts[1].length ]);
    }

    return result;
  }

  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */
  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXX toString XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */
  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  let aZ = [],
      len, tmpString, i, max, out;

  function __toString( radix ){
    // TODO radix support

    len = this['__digits'].length;
    out = '';

    if ( this['__offset'] < 0 ) {
      // number < 0; so just right of the decimal point

      // padding zeros
      if ( this['__offset'] < -1 ) {
        aZ = new Array( Math.abs( this['__offset'] +  1 ) );
        for( i=aZ.length-1; i>=0; --i ) {
          aZ[ i ] = '0000000';
        }
      } else {
        aZ = [];
      }

      // convert digits
      for(i=0; i<len; ++i ) {
        tmpString = String( this['__digits'][i] || '0' );
        out += paddingZeros[ cfg.overflowLength - tmpString.length ] + tmpString;
      }

      // trim trailing zeros
      i = out.length - 1;
      while( (i>0) && out.charAt( i ) === '0' ) { i-= 1; }
      out = out.substring( 0, i+1 );

      // return
      return ( this['__isPositive'] ? '0' : '-0' )
          + cfg.separator
          + aZ.join( '' )
          + out;

    } else if ( len <= (this['__offset']+1) ) {
      // trunc( number ) == 0; so just left of the decimal point

      // padding zeros
      aZ = new Array( this['__offset'] - len +  1 );
      for( i=aZ.length-1; i>=0; --i ) {
        aZ[ i ] = '0000000';
      }

      // convert digits
      out = this['__digits'][0];
      for(i=1; i<len; ++i ) {
        tmpString = String( this['__digits'][i] || '0' );
        out += paddingZeros[ cfg.overflowLength - tmpString.length ] + tmpString;
      }

      return ( this['__isPositive'] ? '' : '-' )
          + out
          + aZ.join( '' );

    } else {
      // number with parts on the left and the right of the decimal point

      // convert digits left of the decimal point
      out = this['__digits'][0];
      for(i=1, max=this['__offset']; i<max; ++i ) {
        tmpString = String( this['__digits'][i] || '0' );
        out += paddingZeros[ cfg.overflowLength - tmpString.length ] + tmpString;
      }

      // append the decimal point
      out += cfg.separator;

      // convert digits right of the decimal point
      for(i=max+1; i<len; ++i ) {
        tmpString = String( this['__digits'][i] || '0' );
        out += paddingZeros[ cfg.overflowLength - tmpString.length ] + tmpString;
      }

      // trim trailing zeros
      i = out.length - 1;
      while( (i>0) && out.charAt( i ) === '0' ) { i-= 1; }
      out = out.substring( 0, i+1 );

      return ( this['__isPositive'] ? '' : '-' )
          + out;
    }
  };

  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */
  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX INTERNAL __add XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */
  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  function __add( that, other ) {
    // get the dimension for the result
    let newOffset = Math.max( that['__offset'], other['__offset'] );
    that['__digits'].length = newOffset   // digits before decimal point
              + Math.max( that['__digits'].length - that['__offset'] , other['__digits'].length - other['__offset']); // and after the decimal point

    // index correction values for both inputs
    let corrValueT = newOffset - that['__offset'],
      corrValueO = newOffset - other['__offset'];
    that['__offset'] = newOffset;

    // compute all digits
    let carry = 0;
    for( let i=that['__digits'].length-1; i>=0; --i ){

      that['__digits'][ i ] = carry    // respect some overflows from the past
                + ( that['__digits'][i - corrValueT ] || 0 )
                + ( other['__digits'][i - corrValueO ] || 0 );

      // check for overflows
      if ( that['__digits'][i] >= cfg.overflow ) {
        if( i>0 ) {
          carry = 1;
          that['__digits'][i] -= cfg.overflow;
        } else {
          that['__digits'][i] -= cfg.overflow;
          that['__digits'].unshift( 1 );
          that['__offset'] += 1;
        }
      } else {
        carry = 0;
      }
    }

    return that;
  }

  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */
  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX INTERNAL __sub XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */
  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  function __sub( that, other ) {
    let comp = __unsignedComp( that, other );

    // that == other
    if( 0 === comp ) {
      that['__digits'] = [0];
      that['__offset'] = 0;
      return that;
    }

    // get the dimension for the result
    let newOffset = Math.max( that['__offset'], other['__offset'] );
    that['__digits'].length = newOffset   // digits before decimal point
              + Math.max( that['__digits'].length - that['__offset'] , other['__digits'].length - other['__offset']); // and after the decimal point

    // index correction values for both inputs
    let corrValueT = newOffset - that['__offset'],
      corrValueO = newOffset - other['__offset'];
    that['__offset'] = newOffset;

    // compute all digits
    let carry = 0;
    for( let i=that['__digits'].length-1; i>=0; --i ){

      that['__digits'][ i ] = carry
                + ( that['__digits'][i - corrValueT ] * comp || 0 )
                - ( other['__digits'][i - corrValueO ] * comp || 0 );

      // check for results below zero
      if ( that['__digits'][i] < 0 ) {
        carry = -1;
        that['__digits'][i] = cfg.overflow + that['__digits'][i];
      } else {
        carry = 0;
      }

    }

    if ( (comp < 0) ) {
      that['__isPositive'] = !that['__isPositive'];
    }

    __cleanup( that, true );

    return that;
  }

  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */
  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX INTERNAL __comp XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */
  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */


  function __unsignedComp( that, other ) {
    // 2nd level
    if ( that['__offset'] < other['__offset'] ) {
      return -1;
    } else if ( that['__offset'] > other['__offset'] ) {
      return 1;
    } else {

    // 3rd level
      // compare the digits
      let max = Math.max( that['__digits'].length, other['__digits'].length );
      for( let i=0; i<max; ++i ) {
        if ( that['__digits'][i] < other['__digits'][i] ) {
          return -1;
        } else if ( that['__digits'][i] > other['__digits'][i] ) {
          return 1;
        }
      }

      // if it hasn't been resolved until now, the aount of digits will solve
      if ( that['__digits'].length < other['__digits'].length ) {
        return -1;
      } else if ( that['__digits'].length > other['__digits'].length ) {
        return 1;
      } else {
        return 0;
      }
    }
  }

  /**
   * compare <that> and <other>.
   * return 1 for <that> > <other>; -1 for <that> < <other>; and zero otherwise
   *
   */
  function __comp( that, other ) {
    // TODO is this useful at all?

    // 0th level types
    // 1st level signs
    // 2nd level compare the offsets
    // 3rd level compare the digits

    // oth level
    if( !other || other._type != that._type ) {
      return 1;
    }

    // 1st level
    if ( that['__isPositive'] !== other['__isPositive'] ) {
      if ( that['__isPositive'] ) {
        return 1;
      } else {
        return -1;
      }
    }

    // level 2 and 3
    const comp = __unsignedComp( that, other );
    return that['__isPositive'] ?  comp : 0 - comp;

  }

  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */
  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX INTERNAL __cleanup XXXXXXXXXXXXXXXXXXXXXXXXXXX */
  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  function __cleanup( that, fromFront ) {

    fromFront = fromFront || true;

    // how many digits are to be deleted from the end?
    let del = 0;
    for( let i=that['__digits'].length-1;
       (i>0) && ( !(that['__digits'][i]) || (that['__digits'][i] === 0) );
       --i ) {
      del += 1;
    }

    // do not remove the last digit
    del = Math.min( that['__digits'].length - 1, del );

    // reduce the length by the amount found
    that['__digits'].length -= del;

    // if necessary, remove from front
    if ( fromFront ) {

      let cnt = 0;
      for( let i=0, max=that['__digits'].length; i<max; ++i ) {
        if ( that['__digits'][i] === 0 ) {
          cnt += 1;
        } else {
          break;
        }
      }

      // do not remove the last digit
      cnt = Math.min( that['__digits'].length - 1, cnt );

      // remove any leading zeros
      if ( cnt > 0 ) {
        that['__digits'].splice( 0, cnt );
        that['__offset'] -= cnt;
      }
    }

    // special case: make 0.0 to 0
    if( (that['__digits'].length == 1)
        && (that['__digits'][0] == 0)
        && (that['__offset'] == -1 )) {
      that['__offset'] = 0;
    }

    return that;
  }

  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */
  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX INTERNAL __mul XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */
  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */
  let carry, carryTot,
      lengthO, lengthT, newOffset, newDigits, indO, indT;
  function __mul( that, other ) {

    lengthO = other['__digits'].length;
    lengthT = that['__digits'].length;

    newOffset = that['__offset'] + other['__offset'];
    newDigits = new Array( lengthT + lengthO );

    carry = 0; carryTot = 0;
    for( indT=lengthT-1; indT>=0; --indT ) {
      for( indO=lengthO-1; indO>=0; --indO ) {

        let runner = indT + indO;

        newDigits[ runner ] = (newDigits[ runner ] || 0 ) + that['__digits'][ indT ] * other['__digits'][indO];

        // take care of "overflows"
        while( (newDigits[runner] >= cfg.overflow) && (runner >= 0) ) {

          carry = Math.floor( newDigits[ runner ] / cfg.overflow );
          newDigits[ runner ] -= carry * cfg.overflow;

          if ( (carry > 0) && (runner > 0) ) {
            newDigits[runner-1] = ( newDigits[runner-1] || 0 ) + carry;
          } else {
            carryTot += carry;
          }
        }
      }
    }

    if ( carryTot > 0 ) {
      newDigits.unshift( carryTot );
      newOffset += 1;
    }

    that['__digits'] = newDigits;
    that['__offset'] = newOffset;
    that['__isPositive'] = that['__isPositive'] === other['__isPositive'];

    return __cleanup( that, true );
  }


  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */
  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX ROUNDING XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */
  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  /**
   * round the given number up to <precision> digits
   * <precision> defines the amount of digits from start on, that should be "exact"
   * <precision> is given for digits to the base of cfg.overflow
   */
  function __round( precision ) {
    // TODO radix support

    // errors
    precision = precision || cfg.defaultPrecision;
    if ( precision <= 0 ) {
      throw new Error( "ArbNumber.round( precision ): <precision> has to be greater than zero" );
    }

    // get the real index to be looked at; including offsets
    let index = this['__offset'] + precision + 1;

    // if we have less digits, there is nothing to do
    if( index >= this['__digits'].length ) {
      return this;
    }

    // the number is smaller than the precision, so make it zero
    if ( index < 0 ) {
      this['__digits'] = [ 0 ];
      this['__offset'] = 0;
      this['__isPositive'] = true;
      return this;
    }

    // we need no round up
    // for rounding down, nothing has to be done, just cutoff the rest
    if( this['__digits'][index] >= cfg.roundingCutoff ) {
      // round up the next value
      index -= 1;

      this['__digits'][index] += 1;

      while( (index>0) && (this['__digits'][index] >= cfg.overflow) ) {
        this['__digits'][index] -= cfg.overflow;
        index -= 1;
        this['__digits'][index] += 1;
      }

      if ( (index === 0) && (this['__digits'][0] >= cfg.overflow) ) {
        this['__digits'][0] -= cfg.overflow;
        this['__digits'].unshift( 1 );
        this['__offset'] += 1;
      }
    }

    // cutoff the rest
    this['__digits' ].length = this['__offset'] + precision + 1;

    return __cleanup( this, true );
  };


  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */
  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX INTERNAL DIVISION XXXXXXXXXXXXXXXXXXXXXXXXXXXXX */
  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  function __inverse( that, precision ) {

    // we can't inverse zero
    if ( (that['__offset'] === 0) && (that['__digits'].length === 1) && that['__digits'][0] === 0 ) {
      throw "ArbNumber.__inverse( that, precision ): Can not compute inverse to zero";
    }

    precision = precision || cfg.defaultPrecision;
    if ( precision <= 0 ) {
      throw new Error("ArbNumber.__inverse( precision ): <precision> has to be greater than zero");
    }

    // short-circuit for powers of ten
    if ( (that['__digits'].length === 1) && (trailZeros.indexOf( that['__digits'][0] ) > -1) ) {

      // get power of ten
      let power = that['__offset'] * cfg.overflowLength + (''+that['__digits'][0]).length - 1;

      // inverse the power
      power = -power;

      // build new number
      const rem = power % cfg.overflowLength,
            div = (power - rem) / cfg.overflowLength;
      that['__offset']    = power < 0 ? div-1 : div;
      that['__digits'][0] = power < 0 ? trailZeros[ Math.abs( rem ) ]
                                      : trailZeros[ trailZeros.length - rem - 1 ];
      return;

    }

    // after http://en.wikipedia.org/wiki/Division_%28digital%29#Binomial_theorem
    const D = that['clone'](),
          N = that;  // recycle this object


    // init f (includes the shifting, such that x is between 0 and 1)
    N['__digits'] = [ 1 ];
    N['__offset'] = 0 - D['__offset'];

    // make sure d is between 0 and 1
    D['__isPositive'] = true;
    D['__offset'] = 0;

    // scale D
    const normFactor = 0.5 / D['__digits'][0],
          normFactorA = new ArbNumber( normFactor );

    D['mul']( normFactorA );
    N['mul']( normFactorA );

    // x = 1-D = -(D-1)
    const x = D.clone().sub( cfg.one );
    x['__isPositive'] = !x['__isPositive'];

    // create the approximation
    let maxRuns = precision * cfg.overflowLength, // very rough upper bound; assumes just one additional 0 for x per iteration
        runs = 0;
    while( (precision > Math.abs(-1 - x['__offset'])) && (runs < maxRuns) ) {

      // count iterations
      runs += 1;

      // factor for this iteration
      const fak = cfg.one['clone']()['add']( x );

      // compute this iteration
      N['mul']( fak );

      // prepare for next iteration
      x['mul']( x );

      // limit the amount of precision here (we do not need x to be more precise than the result)
      x['__digits'].length = precision + 1;

    }

    // rounding the result to the given precision and return
    N['round']( precision );

  }


  function __div( dividend, divisor, precision ) {

    // we can't divide by zero
    if ( (divisor['__offset'] === 0) && (divisor['__digits'].length === 1) && divisor['__digits'][0] === 0 ) {
      throw "ArbNumber.__div( dividend, divisor, precision ): Can not compute inverse to zero";
    }

    precision = precision || cfg.defaultPrecision;
    if ( precision <= 0 ) {
      throw "ArbNumber.__div( dividend, divisor, precision ): <precision> has to be greater than zero";
    }

    // get the inverse element to divisor in order to change the operation to multiplication
    const factor = divisor['clone']();
    __inverse( factor, precision + factor['__offset'] + 1 );

    // do the multiplication and adjust the result
    return dividend['mul']( factor )['round']( precision );
  }

  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */
  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX REAL ADD AND SUB XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */
  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  function __realadd( other ) {
    if ( this['__isPositive'] ) {
      if ( other['__isPositive'] ) {
        // this > 0 && other > 0
        return __add( this, other );
      } else {
        // this > 0 && other < 0
        return __sub( this, other );
      }
    } else {
      if ( other['__isPositive'] ) {
        // this < 0 && other > 0
        return __sub( this, other );
      } else {
        // this < 0 && other < 0
        return __add( this, other );
      }
    }
  }

  function __realsub( other ) {
    if ( this['__isPositive'] ) {
      if ( other['__isPositive'] ) {
        // this > 0 && other > 0
        return __sub( this, other );
      } else {
        // this > 0 && other < 0
        return __add( this, other );
      }
    } else {
      if ( other['__isPositive'] ) {
        // this < 0 && other > 0
        return __add( this, other );
      } else {
        // this < 0 && other < 0
        return __sub( this, other );
      }
    }
  }
  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */
  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX CLONE XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */
  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  function __clone() {

    return Object.create( Object.getPrototypeOf( this ), {
      '__digits':     { value: this['__digits'].slice(0),    writable: true },
      '__offset':     { value: this['__offset'],             writable: true },
      '__isPositive': { value: this['__isPositive'],         writable: true }
    });

  }


  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */
  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX RETURN VALUE XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */
  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  return ArbNumber;
//  return function( arg, radix ){
//    return __constr( arg, radix );
//  };
});