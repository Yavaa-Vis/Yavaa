"use strict";
/**
 * Codemirror language definition
 * has to be kept in sync with /grammar/formula.js
 *
 */
define( [ 'codemirror', 'codemirror.simple'], function( CodeMirror ){

  // TODO investigate possibilities to generate this out of the gramar given in grammar/formula

  CodeMirror.defineSimpleMode( 'yavaa', {
    start: [
      { regex: /value/i,                token: "atom" },
      { regex: /[\+\-\*\/]/,            token: "operator" },
      { regex: /[0-9]+([.,][0-9]+)?/,   token: "number" },
    ]
  });

  return CodeMirror;

});