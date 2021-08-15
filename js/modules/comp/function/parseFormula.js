"use strict";
define( [
          'basic/error',
          'grammar/formula',
          'comp/function/parseFormula/Constants',
          'comp/function/parseFormula/toCode',
          'comp/function/parseFormula/optimizeAST',
          'comp/function/parseFormula/labelTokens',
], function(
          err,
          grammar,
          pConst,
          toCode,
          optimizeAST,
          labelTokens
){

  /**
   * general accessor function for the parse-formula-workflow
   * null values will be piped
   *
   * complete workflow      |   later entry points      | earlier exit points
   *-----------------------------------------------------------------------------------
   * input: formula         |   IN_STRING               |
   * -> parse               |   IN_AST                  | OUT_AST_UNLABELED
   * -> labelTokens         |   IN_AST_LABELED          | OUT_AST
   * -> optimizeAST         |                           | OUT_AST_OPTIMIZED
   * -> toCode              |                           | OUT_CODE
   *
   * @param  {Number}    inputFormat   one of the IN_ constants to specify the format of the input
   * @param  {Number}    outputFormat  one of the OUT_ constants to specify the format of the output
   * @param              input         the actual input
   */
  async function parseFormula( inputFormat, outputFormat, input ) {

    // set default values
    inputFormat   = inputFormat  || pConst.IN_STRING;
    outputFormat  = outputFormat || pConst.OUT_CODE;

    // keep track, if the the tokens already got labeled
    var labeled = false;

    // use a switch for the used entry point; using fall through to simulate workflow
    switch( inputFormat ) {

      case pConst.IN_STRING:

        // tokenize input
        input = grammar.parse( input );

      case pConst.IN_AST:

        // exit point: OUT_AST_UNLABELED
        if( outputFormat == pConst.OUT_AST_UNLABELED ) {
          return input;
        }

        // label AST
        input = labelTokens( input );
        labeled = true;

        // exit point: OUT_AST
        if( outputFormat == pConst.OUT_AST ) {
          return input;
        }

      case pConst.IN_AST_LABELED:

        // optimize the AST
        input = await optimizeAST( input );

        // error handling
        if( input === false ) { return false; }

        // exit point: OUT_AST_OPTIMIZED
        if( outputFormat == pConst.OUT_AST_OPTIMIZED ) {
          return input;
        }

        // exit point: OUT_CODE
        return toCode( input );

    }

    // if we came here, the input format was wrong
    err( 'parseFormula', 'Wrong inputFormat for parseFormula' );
    return null;

  }

  // return
  return parseFormula;

});