"use strict";
/**
 * define test input for search/searchByCombination/createPseudoworkflow
 */
define([ 'basic/Constants' ], function( Constants ){
  
  return {
  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Inputs XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */
  
    A : {
      ds:   'dataset A',
      aggColumns: [],
      columns: [
        { concept: 'alpha', role: Constants.ROLE.DIM,   usedRange: [ 1, 2 ] },
        { concept: 'beta',  role: Constants.ROLE.DIM,   usedRange: [ 1, 2 ] },
        { concept: 'omega', role: Constants.ROLE.MEAS,  usedRange: [ 'a' ] },
      ]
    },
    
    A1 : {
      ds:   'dataset A1',
      aggColumns: [],
      columns: [
        { concept: 'alpha', role: Constants.ROLE.DIM,   usedRange: [ 1 ] },
        { concept: 'beta',  role: Constants.ROLE.DIM,   usedRange: [ 1 ] },
        { concept: 'psi',   role: Constants.ROLE.MEAS,  usedRange: [ 'a1' ] },
      ]
    },
    
    A2 : {
      ds:   'dataset A2',
      aggColumns: [],
      columns: [
        { concept: 'beta',  role: Constants.ROLE.DIM,   usedRange: [ 3 ] },
        { concept: 'alpha', role: Constants.ROLE.DIM,   usedRange: [ 1 ] },
        { concept: 'omega', role: Constants.ROLE.MEAS,  usedRange: [ 'a' ] },
      ]
    },
    
    B : {
      ds:   'dataset B',
      aggColumns: [],
      columns: [
        { concept: 'alpha', role: Constants.ROLE.DIM,   usedRange: [ 1, 2 ] },
        { concept: 'beta',  role: Constants.ROLE.DIM,   usedRange: [ 1, 2 ] },
        { concept: 'psi',   role: Constants.ROLE.MEAS,  usedRange: [ 'b' ] },
      ]
    },    
    
    B1 : {
      ds:   'dataset B',
      aggColumns: [],
      columns: [
        { concept: 'beta',  role: Constants.ROLE.DIM,   usedRange: [ 1, 2 ] },
        { concept: 'alpha', role: Constants.ROLE.DIM,   usedRange: [ 1, 2 ] },
        { concept: 'psi',   role: Constants.ROLE.MEAS,  usedRange: [ 'b' ] },
      ]
    },    
   
    C : {
      ds:   'dataset C',
      aggColumns: [],
      columns: [
        { concept: 'alpha', role: Constants.ROLE.DIM,   usedRange: [ 1, 2 ] },
        { concept: 'beta',  role: Constants.ROLE.DIM,   usedRange: [ 3, 4 ] },
        { concept: 'omega', role: Constants.ROLE.MEAS,  usedRange: [ 'c' ] },
      ]
    },
    
    
    D : {
      ds:   'dataset D',
      aggColumns: [],
      columns: [
        { concept: 'alpha', role: Constants.ROLE.DIM,   usedRange: [ 1, 2 ] },
        { concept: 'beta',  role: Constants.ROLE.DIM,   usedRange: [ 3, 4 ] },
        { concept: 'psi',   role: Constants.ROLE.MEAS,  usedRange: [ 'd' ] },
      ]
    },
    
    E : {
      ds:   'dataset E',
      aggColumns: [],
      columns: [
        { concept: 'alpha', role: Constants.ROLE.DIM, usedRange: [ 1, 2 ] },
        { concept: 'psi',    role: Constants.ROLE.MEAS, usedRange: [ 'e' ] },
      ]
    },
    
    F : {
      ds:   'dataset F',
      aggColumns: [],
      columns: [
        { concept: 'alpha', role: Constants.ROLE.DIM, usedRange: [ 1, 2 ] },
        { concept: 'gamma', role: Constants.ROLE.DIM, usedRange: [ 1, 2 ] },
        { concept: 'psi',    role: Constants.ROLE.MEAS, usedRange: [ 'f' ] },
      ]
    },
    
    /* XXXXXXXXXXXXXXXXXXXXXXXXXXX JOIN after after XXXXXXXXXXXXXXXXXXXXXXXXXXX */
    
    G : {
      ds:   'dataset G',
      aggColumns: [],
      columns: [
        { concept: 'alpha', role: Constants.ROLE.DIM, usedRange: [ 1, 2 ] },
        { concept: 'psi',   role: Constants.ROLE.MEAS, usedRange: [ 'g' ] },
      ]
    },
    
    H1 : {
      ds:   'dataset H1',
      aggColumns: [],
      columns: [
        { concept: 'alpha', role: Constants.ROLE.DIM, usedRange: [ 1 ] },
        { concept: 'omega', role: Constants.ROLE.MEAS, usedRange: [ 'h1' ] },
      ]
    },
    
    H2 : {
      ds:   'dataset H2',
      aggColumns: [],
      columns: [
        { concept: 'alpha', role: Constants.ROLE.DIM, usedRange: [ 2 ] },
        { concept: 'omega', role: Constants.ROLE.MEAS, usedRange: [ 'h2' ] },
      ]
    },

    /* XXXXXXXXXXXXXXXXXXXXXXXXXXX UNION after JOIN XXXXXXXXXXXXXXXXXXXXXXXXXXX */
    
    I1 : {
      ds:   'dataset I1',
      aggColumns: [],
      columns: [
        { concept: 'alpha', role: Constants.ROLE.DIM, usedRange: [ 2 ] },
        { concept: 'omega', role: Constants.ROLE.MEAS, usedRange: [ 'i1' ] },
      ]
    },
    
    I2 : {
      ds:   'dataset I2',
      aggColumns: [],
      columns: [
        { concept: 'alpha', role: Constants.ROLE.DIM, usedRange: [ 2 ] },
        { concept: 'psi',   role: Constants.ROLE.MEAS, usedRange: [ 'i2' ] },
      ]
    },
    
    J : {
      ds:   'dataset J',
      aggColumns: [],
      columns: [
        { concept: 'alpha', role: Constants.ROLE.DIM, usedRange: [ 1 ] },
        { concept: 'omega', role: Constants.ROLE.MEAS, usedRange: [ 'j1' ] },
        { concept: 'psi',   role: Constants.ROLE.MEAS, usedRange: [ 'j2' ] },
      ]
    },
    
    /* XXXXXXXXXXXXXXXXXXXXXXXXXXX dataset with columns to aggregate XXXXXXXXXXXXXXXXXXXXXXXXXXX */

    I2_agg : {
      ds:   'dataset I2',
      aggColumns: [ 1 ],
      columns: [
        { concept: 'alpha', role: Constants.ROLE.DIM, usedRange: [ 2 ] },
        { concept: 'beta',  role: Constants.ROLE.DIM, usedRange: [ 2 ] },
        { concept: 'psi',   role: Constants.ROLE.MEAS, usedRange: [ 'i2' ] },
      ]
    },
  };
  
});