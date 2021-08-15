"use strict";
/**
 * validate the given actionDef against the list of actionDefs given
 *
 *
 */
define( [], function(){

  /**
   * @param msg         {Object}    the object as received/sent
   * @param Actions     {Object}    the list of actionDefs to validate against
   * @param errorCb     {Function}  a function to call with an error message, if msg is not valid
   * @returns           {Boolean}   is the message valid?
   */
  return function validateMessage( msg, Actions, errorCb ){

    // check the actionDef
    if( !( 'action' in msg ) ||
        !( typeof msg['action'] === 'string' ) ||
        !( msg['action'] in Actions ) ) {

      errorCb( `Command not found: ${(msg['action'] || '--no action given--')}` );
      return false;
    }

    // shortcut
    const actionDef = Actions[ msg['action'] ];

    // check parameters (required)
    if ( ('params' in actionDef) && (actionDef['params'].length > 0) ) {

      // no params posted
      if( !('params' in msg ) ) {
        errorCb( `Parameters missing` );
        return false;
      }

      // params should be an object
      if( typeof msg.params != 'object' ) {
        errorCb( `Parameters should be passed as object` );
        return false;
      }

      let param, def;
      for( var i=0, max=actionDef['params'].length; i<max; i++ ) {

        // check for existence
        if( !actionDef['params'][i]['optional'] && !( actionDef['params'][i]['name'] in msg['params'] ) ) {
          errorCb( `Missing parameter: ${actionDef['params'][i]['name']}` );
          return false;
        }
      }
    }


    // check parameters (superfluous)
    if( 'params' in msg ) {

      // get param keys
      const submittedParams = Object.keys( msg['params'] );

      if( 'params' in actionDef ) {

        // get expected parameters
        const expectedParams = actionDef.params.map( (a) => a.name );

        // check, there is nothing in addition
        for( let i=0; i<submittedParams.length; i++ ) {

          if( !expectedParams.includes( submittedParams[i] ) ) {

            // found a superfluous parameter
            errorCb( `Superfluous parameter: ${submittedParams[i]}` );
            return false;

          }

        }

      } else {

        // there should be no parameters ...
        errorCb( `Message is expected to have no parameters!` );

      }

    }


    // check parameters types
    if ( 'params' in msg ) {

      // submitted paramters
      const params = Object.keys( msg.params );

      for( let key of params ) {

        // get the respective value
        const value         = msg.params[ key ],
              valueType     = typeof value,
              isValueArray  = value instanceof Array,
              def           = actionDef['params'].find( a => a.name == key );

        // if the respective type is in the list of allowed, everything is fine
        // need to verify objects vs arrays later on in more detail
        if( !isValueArray && def.type.includes( valueType ) ) {
          continue;
        }


        // check arrays
        if( isValueArray ) {

          // the definition list has to include array
          if( !def.type.includes( 'array') ) {
            errorCb( `Invalid type for parameter (${def['name']}): Expected ${def['type'].join(' or ')}, but found array - ${JSON.stringify( value )}` );
            return false;
          }

          // do we need to check for types?
          if( !def.arraytype ){
            continue;
          }

          // what types are in the array?
          const foundTypes = [ ... new Set( value.map( v => {
                                                    if( v instanceof Array ) {
                                                      return 'array';
                                                    } else {
                                                      return typeof v;
                                                    }
                                                  }) ) ];

          // the found types should be allowed
          for( let foundType of foundTypes ) {
            if( !def.arraytype.includes( foundType ) ) {
              errorCb( `Invalid type for element in parameter (${def['name']}): Expected one of ${JSON.stringify(def.arraytype)}, but found ${foundType} - ${JSON.stringify( value )}` );
              return false;
            }
          }

          // everything checked out
          continue;
        }


        // check enums
        if( def.enumeration ) {
          if( !def.enumeration.includes( value ) ) {
            errorCb( `Unknown value for parameter (${def['name']}): ${value}` );
            return false;
          } else {
            continue;
          }
        }


        // primitive type did not match
        errorCb( `Invalid type for parameter (${def['name']}): Expected ${def['type'].join(' or ')}, but found ${valueType} - ${JSON.stringify( value )}` );
        return false;

      }

    }


    // passed all rules
    return true;

  }

});