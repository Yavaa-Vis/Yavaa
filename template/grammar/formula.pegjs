/*
 * Grammar to parse arithmetic formulae in Yavaa
 * adapted from https://github.com/pegjs/pegjs/blob/master/examples/arithmetics.pegjs
 *
 */

/* Term: addition, subtraction */
TERM_ADD = 
  _ head:TERM_MUL _ tail:(_ operator:ADD_OPERATOR _ right:TERM_MUL _)* _
  { 
    return tail.reduce(function(result, match) {
      return { value: match[1], children:[ result, match[3] ] };
    }, head );
  }

/* Term: multiplication, division */
TERM_MUL =
  _ head:FACTOR _ tail:(_ operator:MUL_OPERATOR _ right:FACTOR _)* _
  { 
    return tail.reduce(function(result, match) {
      return { value: match[1], children:[ result, match[3] ] };
    }, head );
  }

/* factor in TERM_MUL */
FACTOR
  = _ "(" _ expr:TERM_ADD _ ")" _ 
  { return expr; }
  / _ operand:OPERAND _
  { return operand; }

/* operands */
OPERAND =
  _ operand:(NUMBER / VALUE) _
  { return { value: operand }; }

/* numbers */
NUMBER =
  _ number: $([0-9]+([,.][0-9]+)?) _
  { return number; }
  
/* values */
VALUE = 
  _ value: ("value" / 'col0' / $('col'[1-9][0-9]*) ) _
  { return value; }

/* operators */
OPERATOR =
  ADD_OPERATOR / MUL_OPERATOR
ADD_OPERATOR =
  _ operator:("+"/'-') _
    { return operator; }
MUL_OPERATOR =
  _ operator:("*"/'/') _
    { return operator; }

/* whitespaces */
_ =
  ( " " / "\t" / "\n" / "\r" )*
    { return; }