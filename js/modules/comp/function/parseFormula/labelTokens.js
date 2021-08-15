"use strict";
/**
 *
 */
define( [
         'basic/error',
         'comp/function/parseFormula/Constants'
], function( err, pConst ){

  /**
   * label the given list of tokens
   * @param   {Array|Object}   tokens   Array or AST of tokens
   * @return  {Array}
   */
  return function labelTokens( tokens ) {

    // switch between types
    if( tokens instanceof Array ) {
      return traverseArray( tokens, labelToken );
    } else {
      const res = traverseAST( tokens, undefined, labelToken );
      return res;
    }
  }

  /**
   * label a single given token
   */
  function labelToken( token, nextToken ) {

    if( pConst.cfg.numberRegex.test( token ) ) {

      // ... a number
      return pConst.TOKEN_NUMBER;

    } else if ( pConst.cfg.tokenSeparator.indexOf( token ) > -1 ) {

      // ... an operator

      if ( token === '(' ) {
        // left parenthesis
        return pConst.TOKEN_LEFT_PARENTHESIS;

      } else if ( token === ')' ) {
        // right parenthesis
        return pConst.TOKEN_RIGHT_PARENTHESIS;

      } else {
        // rest (operators)
        return pConst.TOKEN_OP;
      }

    } else {
      // ... a function or variable

      // variables are followed by an operator,
      // functions have a parenthesis next

      if( nextToken && (nextToken === '(') ) {
        // there is a next token and it is a parenthesis, so this is a function
        return pConst.TOKEN_FUNCTION;

      } else {
        // it is the last token or followed by an operator, so it must be a variable
        return pConst.TOKEN_VARIABLE;
      }
    }

  }

  /**
   * traverse an Array of tokens and label them
   */
  function traverseArray( arr, labeler ) {

    return arr.map( (token, ind) => {
        return {
          value: token,
          type:  labeler( token, arr[ ind+1 ] ),
        };
      });

  }

  /**
   * traverse an AST of tokens an label them
   * walking order does not matter
   */
  function traverseAST( root, parent, labeler ) {

    // label current node
    root.type = labeler( root.value );
    if( parent ) {
      root.parent = parent;
    }

    // process all children, if present
    if( 'children' in root ) {
      for( let i=0; i<root.children.length; i++ ) {
        traverseAST( root.children[i], root, labeler );
      }
    }

    return root;
  }

});