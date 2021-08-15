/**
 * returns a standardized error message object for transmission:
 * {
 *    'action: 'error',
 *   'param': {
 *     'stack': the call stack,
 *     'ts :    the timestamp of the error,
 *     'src':   the module, which the error occurred in,
 *     'msg':   a message by the module
 *   }
 * }
 */

define( [], function(){

  /**
   * Error Wrapper object, which is serializable
   */
  function ErrorWrapper( source, err ){

    // no parameter given: plain object used for deserialization
    if( typeof source == 'undefined' ) {
      return;
    }

    // single parameter call
    if( typeof err == 'undefined' ) {
      err = source;
      source = 'global';
    }

    // some distinction
    let stack,
        message;
    if( typeof err == 'string' ) {                   // string with error message
      message = err;
    } else if( err instanceof Error ) {              // native error objects
      stack   = err.stack;
      message = err.message;
    } else if( err instanceof ErrorWrapper ) {       // already wrapped errors
      stack   = err.stack;
      message = err.msg;
    } else if( ('originalEvent' in err)
            && ('error' in err.originalEvent )) {    // jQuery error-events
      err = err.originalEvent.error;
      stack   = err.stack;
      message = err.message;
    } else {                                         // other
      message = err;
      stack   = '';
    }

    // save values
    this._setVal( 'stack',  stack );
    this._setVal( 'ts',     Date.now() );
    this._setVal( 'src',    source );
    this._setVal( 'msg',    message );

  }


  /**
   * internal function to set properties
   */
  ErrorWrapper.prototype._setVal = function( name, val ) {
    Object.defineProperty( this, name, {
      'value': val
    });
  };


  /**
   * set the job id
   * might change, if the error comes from a nested JobQueue
   */
  ErrorWrapper.prototype.setJobID = function setJobID( jobID ){
    this['jobid'] = jobID;
  }


  /**
   * serialize to JSON
   */
  ErrorWrapper.prototype.toJSON = function(){
    return {
      'action':   'error',
      'params': {
        'stack':  this['stack'],
        'ts':     this['ts'],
        'src':    this['src'],
        'msg':    this['msg'],
      },
      '_jobID':   this['jobid'],
    };
  }

  /**
   * console serialization
   */
  ErrorWrapper.prototype.toString = function toString(){
    return '[ErrorWraper: ' + this['msg'] + ']';
  }
  if( typeof window != 'undefined' ) {
    // client side
    ErrorWrapper.prototype.inspect = ErrorWrapper.prototype.toString;
  } else {
    // server side
    const Util = require( 'util' );
    ErrorWrapper.prototype[ Util.inspect.custom ] = ErrorWrapper.prototype.toString;
  }


  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Export XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

   function createError( source, err ) {

      if( source instanceof ErrorWrapper ) {

        // already wrapped
        return source;

      } else if ( err instanceof ErrorWrapper ) {

        // already wrapped
        return err;

      } else {

        // need to wrap
        return new ErrorWrapper( source, err );

      }

    };

    /**
     * parse a toJSON-serialized error object
     */
    createError.parseError = function parseError( src ) {
      const res = new ErrorWrapper();
      res._setVal( 'stack',  src.stack );
      res._setVal( 'ts',     src.ts    );
      res._setVal( 'src',    src.src   );
      res._setVal( 'msg',    src.msg   );
      return res;
    }

    /**
     * test, whether an object is an instance of ErrorWrapper
     */
    createError.isError = function isError( err ){
      return err instanceof ErrorWrapper;
    }

    return createError;

});