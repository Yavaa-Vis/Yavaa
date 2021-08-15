"use strict";
/**
 * add a legend for provided colors to the given document
 */
define( [], function(){

  // fix the width of a legend item
  const MAXCHARACTERS = 25,
        EM2PIXEL      = 8.5,
        MAXCOLUMNS    = 15,
        COLGAP        = 10;

  /**
   * provide the shown version of the label
   * has to be shorter than MAXCHARACTERS
   */
  function shortenLabel( label, all ) {

    // if it is already, shorter, there is nothing to do
    if( label.length <= MAXCHARACTERS ) {
      return label;
    }

    // TODO: some clever way of shortening

    // if nothing else works, just cut it off
    return label.substring( 0, MAXCHARACTERS ) + '…';

  }


  return function( doc, d3, target, width, colors ){

    // get the target element
    const $target = d3.select( doc ).select( target );

    // prepare labels
    const data = colors.domain()
      .sort()
      .map( (l) => {
        const label = '' + l,
              shown = shortenLabel( label ),
              width = shown.length * EM2PIXEL + 30 + 5;
        return { src: label, shown, width };
      });

    // calc the "optimal" column width
    let bestColCount = 1;
    const colWidths = (new Array( MAXCOLUMNS )).fill( 0 );
    for( let colCount=MAXCOLUMNS; (colCount>0) && (bestColCount < 2); colCount-- ) {

      // column widths
      colWidths.length = colCount;
      colWidths.fill( 0 );
      for( let i=0; i<data.length; i++ ) {
        const col = i % colCount
        colWidths[ col ] = Math.max( colWidths[ col ], data[i].width );
      }

      // does it fit within our overall width?
      const totalWidth = colWidths.reduce( (sum,el) => sum+el, 0 ) + (colWidths.length - 1) * COLGAP;
      if( totalWidth < width ) {
        bestColCount = colCount;
        break;
      }

    }

    // calculate the column distances from the start
    const colStart = colWidths.map( (el,i) => {
      return i * COLGAP +
        colWidths.slice( 0, i ).reduce( (sum,el) => sum+el, 0 );
    });

    // shortcut to elements per row
    const perRow = colStart.length;

    // append legend items
    const items = $target.selectAll( '.legendItem' )
                           .data( data )
                         .enter().append( 'g' )
                           .attr( 'class', 'legendItem' )
                           .attr( 'transform', (d,i) => {
                             const x = colStart[i % perRow].toFixed( 2 ),
                                   y = (Math.floor( i/perRow ) * 20 + 5).toFixed( 2 );
                             return `translate( ${x} ${y} )`;
                           })

    // add rectangles
    items.append( 'rect' )
           .style( 'fill',    (d) => colors(d.src) )
           .style( 'stroke',  'black' )
           .attr( 'x', 0 )
           .attr( 'y', 0 )
           .attr( 'height', '10' )
           .attr( 'width', '30' )

    // add text
    items.append( 'text' )
            .text( (d) => d.shown )
            .attr( 'x', 35 )
            .attr( 'y', 5 )
            .style( 'dominant-baseline', 'central' )
            .style( 'text-anchor', 'start' )
            .style( 'fill', 'currentColor' )

    // return the total height of the legend added
    return Math.ceil( colors.domain().length / perRow ) * 20 + 5;

  };
});
