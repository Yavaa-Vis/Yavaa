"use strict";
/**
 * return a maximum matching for a given cost matrix
 *
 * Input:
 * cost matrix for all involved nodes
 *
 * Implementation follows http://community.topcoder.com/tc?module=Static&d1=tutorials&d2=hungarianAlgorithm
 */
// TODO maybe rewrite, cuz of licencing
define( function(){

  // @const
  const DUMMY_COST = -1000;

  // variables
  var cost,             // adjacency matrix for the given graph containing the weights
      max_matching,     // number of currently matched vertices
      n,                // amount of X and Y
      lx, ly,           // arrays holding the current labels for all X and Y
      xy,               // array to hold which Y is an X matched with
      yx,               // array to hold which X is an Y matched with
      S, T,             // Sets for already matched elements
      slack,            // array to hold slack values
      slackX,           // array to hold vertex, such that l(slackx[y]) + l(y) - w(slackx[y],y) = slack[y]
      prev;             // array to hold alternating paths

  var x,y;              // loop variables

  /**
   * provide a matching for the weighted graph given by adjacency matrix cost
   */
  function match( inpCost ) {

    // save link to global variable
    cost = inpCost;

    // make sure the cost matrix is quadratic
    n = cost.length > cost[0].length ? cost.length : cost[0].length;
    for( x=0; x<n; x++ ) {
      cost[ x ] = cost[ x ] || [];
      for( y=0; y<n; y++ ){
        cost[ x ][ y ] = typeof cost[ x ][ y ] == 'undefined' ? DUMMY_COST : cost[ x ][ y ];
      }
    }

    // reset all variables
    max_matching = 0;
    n = cost.length;
    xy = (new Array( n )).fill( -1 );
    yx = (new Array( n )).fill( -1 );

    init_labels();
    augment();

    // build answer
    var result = [];
    for( x=0; x<n; x++ ) {

      // exclude dummy vertices
      if( cost[ x ][ xy[x] ] != DUMMY_COST ) {
        result.push( [ x, xy[x] ] );
      }

    }

    return result;
  }


  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  function init_labels(){

    lx = [];
    ly = [];

    for( x=0; x<n; x++ ) {

      // X-Labels: maximum of all attached edges
      lx.push( 0 );
      for( y=n; y--; ) {
        lx[ x ] = lx[ x ] > cost[x][y] ? lx[ x ] : cost[x][y];
      }

      // Y-labels: set to 0
      ly.push( 0 );

    }

  }

  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  function augment(){

    // we already found a complete matching
    if( max_matching >= n ) { return; }

    // local variables
    var root,       // root of a subtree in subtree
        queue = [], // queue for bfs search
        rd = 0,     // read position within queue
        val;

    // reinit global variables
    S = new Set();
    T = new Set();
    prev = (new Array( n )).fill( -1 );

    // find root of tree
    for( x=0; x<n; x++ ) {
      if( xy[x] == -1 ) {
        root = x;
        queue.push( x );
        prev[x] = -2;
        S.add( x );
        break;
      }
    }

    // initialize slack array
    slack = new Array( n );
    slackX = new Array( n );
    for( y=0; y<n; y++ ) {
      slack[ y ] = lx[ root ] + ly[ y ] - cost[ root ][ y ];
      slackX[ y ] = root;
    }

    // main cycle
    while( true ) {

      // build tree using BFS
      while( rd < queue.length ) {

        // current vertex from X
        x = queue[ rd ];
        rd += 1;

        // iterate through all edges in equality graph
        for( y=0; y<n; y++ ){
          if( (cost[x][y] === lx[ x ] + ly[ y ]) && !T.has( y ) ) {

            // an exposed vertex in Y found, so augmenting path exists
            if( yx[ y ] == -1 ) {
              break;
            }

            // else just add y to T
            T.add( y );

            // add matched vertex to queue
            queue.push( yx[ y ] );

            // add edges (x,y) and (y,yx[y]) to the tree
            add_to_tree( yx[y], x );

          }
        } // for

        // augmenting path found
        if( y<n ) {
          break;
        }

      } // while

      // augmenting path found
      if( y<n ) {
        break;
      }

      // no augmenting path found, improve labeling
      update_labels();
      queue = [];
      rd = 0;

      // in this cycle we add edges that were added to the equality graph as a
      // result of improving the labeling, we add edge (slackx[y], y) to the tree if
      // and only if !T[y] &&  slack[y] == 0, also with this edge we add another one
      // (y, yx[y]) or augment the matching, if y was exposed
      for( y=0; y<n; y++ ) {

        if( !T.has( y ) && (slack[ y ] == 0) ){

          // exposed vertex found -> augmenting path
          if( yx[ y ] == -1 ) {
            x = slackX[y];
            break;
          }

          // else just add y to T
          T.add( y );

          if( !S.has( yx[ y ] ) ) {

            // add matched vertex to queue
            queue.push( yx[ y ] );

            // add edges (x,y) and (y,yx[y]) to the tree
            add_to_tree( yx[ y ], slackX[ y ] );
          }

        }

      } // for

      // augmenting path found
      if( y < n ) {
        break;
      }

    } // while


    // we found an augmenting path
    if ( y < n ) {
      max_matching += 1;

      // in this cycle we inverse edges along augmenting path
      for (var cx = x, cy = y, ty; cx != -2; cx = prev[cx], cy = ty) {
          ty = xy[cx];
          yx[cy] = cx;
          xy[cx] = cy;
      }

      // next iteration
      augment();
    }
  }

  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  function update_labels() {

    var delta = Number.MAX_VALUE;

    // find delta
    for( y=0; y<n; y++){
      if( !T.has( y ) ){
        delta = delta < slack[ y ] ? delta : slack[ y ];
      }
    }

    // update labels and slacks
    for( x=0; x<n; x++ ){

      // x labels
      if( S.has( x ) ) {
        lx[x] -= delta;
      }

      // y-labels and slacks
      if( T.has( x ) ) {
        ly[ x ] += delta;
      } else {
        slack[ x ] -= delta;
      }
    }
  }

  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  function add_to_tree( x, prevx ) {

    // x - current vertex,prevx - vertex from X before x in the alternating path,
    // so we add edges (prevx, xy[x]), (xy[x], x)

    // add x to S
    S.add( x );

    // remember for augmenting path
    prev[ x ] = prevx;

    // update slacks
    for( y=0; y<n; y++ ) {
      if( lx[x] + ly[y] - cost[x][y] < slack[y] ) {
        slack[y]  = lx[x] + ly[y] - cost[x][y];
        slackX[y] = x;
      }
    }
  }


  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Polyfill XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  /**
   * polyfill für Array.fill
   * https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Array/fill
   */
  if (!Array.prototype.fill) {
    Array.prototype.fill = function(value) {

      // Steps 1-2.
      if (this == null) {
        throw new TypeError('this is null or not defined');
      }

      var O = Object(this);

      // Steps 3-5.
      var len = O.length >>> 0;

      // Steps 6-7.
      var start = arguments[1];
      var relativeStart = start >> 0;

      // Step 8.
      var k = relativeStart < 0 ?
        Math.max(len + relativeStart, 0) :
        Math.min(relativeStart, len);

      // Steps 9-10.
      var end = arguments[2];
      var relativeEnd = end === undefined ?
        len : end >> 0;

      // Step 11.
      var final = relativeEnd < 0 ?
        Math.max(len + relativeEnd, 0) :
        Math.min(relativeEnd, len);

      // Step 12.
      while (k < final) {
        O[k] = value;
        k++;
      }

      // Step 13.
      return O;
    };
  }

  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Exporting XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  return match;
});