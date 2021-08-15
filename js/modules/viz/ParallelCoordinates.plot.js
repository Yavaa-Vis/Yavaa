"use strict";
/**
 * actual plotting of a Parallel Coordinates chart
 */
define( [ 'viz/helper/colorLegend' ], function( legend ){

  return function( document, d3, data, param ) {

    // maximum length of a title
    const maxTitleLength = param._titles.reduce( (all,t) => t.length > all ? t.length : all, 0 );

    // add some margin:
    param.margin = {
      top:         20 + maxTitleLength * 4,   // crude heuristic for the length
      right:       80,
      bottom:      30,
      left:        50,
      nullMargin:  40,
    };

    // select svg
    const svg = d3.select( document ).select( '#' + param.id )
                    .attr( 'viewBox', `0 0 ${param.width} ${param.height}` )
                  .append( 'g' )
                    .attr( 'transform', `translate(${param.margin.left}, ${param.margin.top})` );

    param.width  -= param.margin.left + param.margin.right;
    param.height -= param.margin.top + param.margin.bottom;

    // is color bound?
    const colored = ('color' in param) && (typeof param.color != 'undefined');

    // see, if we have to handle null values
    const nullValues = param._domains.some( d => d && d.hasNull ),
          nullLineY = param.height;
    if( nullValues ){

      // add a distinct container
      const cont = svg.append( 'g' )
                      .attr( 'class', 'missing' );

      // a null-line
      cont.append( 'path' )
          .attr( 'd', `M 0,${param.height} ${param.width},${param.height}` )
          .attr( 'class', 'axis' )

      // legend
      cont.append( 'text' )
          .attr( 'x', param.width + 3 )
          .attr( 'y', param.height )
          .style( 'text-anchor', 'start')
          .style( 'dominant-baseline', 'central' )
          .style( 'fill', 'currentColor' )
          .text( 'missing' )

      // adjust the overall height
      param.height -= param.margin.nullMargin;

    }

    // add scales, if not present
    if( !('_scales' in param) || !param._scales ) {
      param._scales = param._domains
                        .map( (d) => {

                          // skip unbound columns
                          if( !d ) { return }

                          let scale;
                          if( 'list' in d ){
                            scale = d3.scalePoint()
                                      .domain( d.list.sort() );
                          } else {
                            scale = d3.scaleLinear()
                                      .domain( [ d.max, d.min ] );
                          }
                          scale.range( [0, param.height ] );
                          return scale;
                        });

      // color scale
      const color   = d3.scaleOrdinal( d3.schemeCategory10 );
      if( colored && !param._hideLegend ) {

        // set domain for coloring
        color.domain( data.map( e => e[0][0].isNull ? 'missing' : e[0][0] ) );

        // append legend
        const legendContainer = svg.append( 'g' ).attr( 'id', 'legend' ),
              legendHeight    = legend( document, d3, '#legend', param.width, color );
        param.height -= legendHeight;
        legendContainer.attr( 'transform', `translate( ${param.margin.left} ${param.height + param.margin.bottom} )` );

      }

      // remember color-scale in scales
      param._scales[0] = color;

    }

    // use color scale
    const color = param._scales[0];

    // use the scales for the y-axes
    // drop the first column as this is for color
    const y = param._scales.slice(1);

    // scale for x-axis
    const x = d3.scalePoint()
                .range( [0, param.width] )
                .domain( y.map( (el,i) => i ) )
                .padding( 0 );

    // path creation
    const path = d3.line();

    // convert single row to coordinates
    const row2coord = (d) => path( y.map( (el,i) => [ x(i), d[i+1].isNull ? nullLineY : y[i]( d[i+1] ) ] ) );

    // draw paths
    svg.append( 'g' )
         .attr( 'class', 'paths' )
       .selectAll( 'path' )
         .data( data )
       .enter().append( 'path' )
         // access d[i+1], as d[0] is for the color and just the remainder for the path
         .attr(   'd',      (d) => d.map( row2coord ).join( ' ' ) )
         .style( 'stroke',  (d) => colored ? color( d[0][0] ) : 'steelblue' );

    // add axis
    const axis = d3.axisLeft()
                    .tickSize(0)
                    .tickPadding(10);
    svg.append( 'g' )
          .attr( 'class', 'axes' )
        .selectAll( 'g' )
          .data( param._domains.slice( 1 ) )
        .enter().append( 'g' )
          .attr( 'class', 'axis' )
          .attr( 'transform', (d,i) => `translate( ${x(i)} 0 )` )
          .each( function(d,i){ d3.select( this ).call( axis.scale( y[i] ) ); })
          .append( 'text' )
            .text( (d,i) => param._titles[ i ] )
            .attr( 'y', -10 )
            .attr( 'transform', 'rotate( -45 0 -10 )' )

  };

});