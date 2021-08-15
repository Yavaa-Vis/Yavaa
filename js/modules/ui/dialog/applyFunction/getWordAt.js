"use strict";
/**
 * return the next word starting at the given location in str
 * if pos is within a word, just returns the part of the word starting at pos
 *
 * after https://stackoverflow.com/a/5174867/1169798
 *
 * @param     {String}    str   the input string
 * @param     {Number}    pos   the starting position of the word
 * @returns   {String}          the word starting at pos
 */
define( [], function(){

  return function getWordAt(str, pos) {

   // Perform type conversions.
   str = String(str);
   pos = Number(pos) >>> 0;

   // Search for the word's beginning and end.
   var right = str.slice(pos).search(/[^a-zA-Z0-9.,]/);

   // The last word in the string is a special case.
   if (right < 0) {
       return str.slice(pos);
   }

   // the size of the result should at least be one character
   if( right < 1 ) {
     right = 1;
   }

   // Return the word, using the located bounds to extract it from the string.
   return str.slice( pos, right + pos);

  }

});