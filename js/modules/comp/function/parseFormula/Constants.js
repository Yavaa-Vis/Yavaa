"use strict"
/**
 * Set of constants used in formula parsing and directly dependent operations
 */
define( [], function(){
  return {

    // constants for inputFormat parameter of parseFormula()
    IN_STRING            : 1,
    IN_AST               : 2,
    IN_AST_LABELED       : 3,

    // constants for outputFormat parameter of parseFormula()
    OUT_CODE             : 1,
    OUT_AST_OPTIMIZED    : 2,
    OUT_AST              : 3,
    OUT_AST_LABELED      : 3,   // just an alias for better readability
    OUT_AST_UNLABELED    : 4,


    // other constants for outputFormat parameters
    OUT_FUNCTION         : 100,

    // constants for token types
    TOKEN_NUMBER     : 0,
    TOKEN_OP         : 1,
    TOKEN_VARIABLE   : 2,
    TOKEN_FUNCTION   : 3,
    TOKEN_LEFT_PARENTHESIS : 4,
    TOKEN_RIGHT_PARENTHESIS : 5,
    TOKEN_CONSTANT   : 6,
    TOKEN_TERM       : 7,

    // configuration for the formula parsing
    cfg: {
        tokenSeparator: [ '*', '/', '+', '-', ')', '(', ',' ],           // separating two tokens from another and being a token by itself
        opPrecedence: [ '*', '/', '+', '-' ],                            // sorted by precedence descending
        numberRegex:  /^[+-]{0,1}[0-9]+(?:[\.][0-9]+)?([eE][+-]?[1-9][0-9]*)?$/,  // RegExp to recognize numbers
        exponents: [ 'e', 'E' ],                                         // characters in scientific notation numbers
        digits: [ '1', '2', '3', '4', '5', '6', '7', '8', '9', '0' ],    // digits
    }
  };
});