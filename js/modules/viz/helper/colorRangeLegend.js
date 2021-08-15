"use strict";
/**
 * add a legend for provided colors to the given document
 */
define( [], function(){

  return function( doc, d3, target, width, colors ){

    // get the target element
    const $target = d3.select( doc ).select( target );

    // create a matching gradient
    const gradId = 'legendGradient' + Date.now(),
          stops = colors.ticks()
                        .map( (d,i,n) => { return {
                          o: i / (n.length - 1),
                          c: colors( d ),
                        }});
    $target.append( 'defs' )
           .append( 'linearGradient')
             .attr( 'id', gradId )
           .selectAll( 'stop' )
             .data( stops )
           .enter().append( 'stop' )
             .attr( 'offset', (d) => `${100 * d.o}%`  )
             .attr( 'stop-color', (d) => d.c )

    // add rectangle
    $target.append( 'rect' )
           .style( 'fill',    `url(#${gradId})` )
           .style( 'stroke',  'black' )
           .attr( 'x', 100 )
           .attr( 'y', 2 )
           .attr( 'height', '10' )
           .attr( 'width',  width - 200 )

    // add text
    $target.append( 'text' )
            .text( (d) => colors.domain()[ 0 ] )
            .attr( 'x', 95 )
            .attr( 'y', 7 )
            .style( 'dominant-baseline', 'central' )
            .style( 'text-anchor', 'end' )
            .style( 'fill', 'currentColor' )
    $target.append( 'text' )
            .text( (d) => colors.domain()[ 1 ] )
            .attr( 'x', width - 95 )
            .attr( 'y', 7 )
            .style( 'dominant-baseline', 'central' )
            .style( 'text-anchor', 'start' )
            .style( 'fill', 'currentColor' )

    // return the total height of the legend added
    return 10 + 5;

  };
});