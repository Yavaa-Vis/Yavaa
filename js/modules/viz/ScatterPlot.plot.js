'use strict';
/**
 * actual plotting of a ScatterPlot
 */
define( [ 'viz/helper/colorLegend' ], function( legend ){

  return function( document, d3, data, param ) {

    // add some margin:
    param.margin = {
      top:    20,
      right:  80,
      bottom: 30,
      left:   50
    };

    // select svg
    const svg = d3.select( document )
                  .select( '#' + param.id )
                  .attr( 'viewBox', '0 0 ' + (param.width + param.margin.left + param.margin.right) + ' ' + (param.height + param.margin.top + param.margin.bottom) )
                  .attr( 'xmlns:xlink', 'http://www.w3.org/1999/xlink' )
                .append('g')
                  .attr('transform', 'translate(' + param.margin.left + ',' + param.margin.top + ')');

    // add scales, if not present
    if( !('_scales' in param) || !param._scales ) {

      const xDomain   = param._domains[ param.xaxis ],
            yDomain   = param._domains[ param.yaxis ],
            catDomain = param._domains[ param.category ];
      let catValues = [];
      if( (typeof catDomain != 'undefined') ) {
        catValues = catDomain.list;
        if( catDomain.hasNull ) {
          catValues = catValues.concat( [ 'missing' ] );
        }
      }
      param._scales = [
        // color
        d3.scaleOrdinal( d3.schemeCategory10 )
          .domain( catValues ),
        // x-axis
        d3.scaleLinear()
          .range( [ 0, param.width] )
          .domain( [ xDomain.min, xDomain.max ] ),
        // y-axis
        d3.scaleLinear()
          .range( [param.height, 0] )
          .domain( [ yDomain.min, yDomain.max ])
      ];

    }

    // scales
    const color = param._scales[0],
          x     = param._scales[1],
          y     = param._scales[2];

    // append legend
    if( !param._hideLegend && (color.domain().length > 0) ) {

      // add legend
      const legendContainer = svg.append( 'g' ).attr( 'id', 'legend' ),
            legendHeight    = legend( document, d3, '#legend', param.width, color );
      param.height -= legendHeight;
      legendContainer.attr( 'transform', `translate( ${param.margin.left} ${param.height + param.margin.bottom} )` );

      // adjust y-scale
      y.range( [ param.height, 0 ] );

    }

    // axes
    const xAxis = d3.axisBottom( x ),
          yAxis = d3.axisLeft( y );

    // add marker-templates
    const markers   = new Map(),
          symbolMap = d3.scaleOrdinal()
                        .domain( color.domain() )
                        .range( d3.symbols ),
          symbols = d3.symbol()
                      .size( 64 )
                      .type( (d) => symbolMap( d ) ),
          markerDefs = svg.append( 'defs' )
                           .selectAll( '.markerdef' )
                             .data( color.domain() )
                           .enter().append( 'g' )
                             .attr( 'class', 'markerdef' )
                             .attr( 'id', (d,i) => {
                                             const id = `${param.id}_${i}`;
                                             markers.set( d, id )
                                             return id;
                                           });
    markerDefs.append( 'path' )
                .attr( 'd', symbols )
                .style( 'fill', (d) => color( d ) )

    // x-axis
    svg.append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate(0,' + param.height + ')')
        .call(xAxis)
      .append('text')
        .attr('x', param.width )
        .attr('dy', '-0.3em')
        .style('text-anchor', 'end')
        .style( 'fill', '#000' )
        .text( param.title.xaxis );

    // y-axis
    svg.append('g')
        .attr('class', 'y axis')
        .call(yAxis)
      .append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', 6)
        .attr('dy', '.71em')
        .style('text-anchor', 'end')
        .style( 'fill', '#000' )
        .text( param.title.yaxis );

    // dots
    svg.append( 'g' )
          .attr( 'class', 'markers' )
          .attr( 'transform', (d) => `translate( 0 ${param.height} )` )
        .selectAll( '.marker' )
          .data( data.values )
        .enter().append( 'xlink:use' )
          .attr( 'x', (d) => x( +d.x ) )
          .attr( 'y', (d) => -y( +d.y ) )
          .attr( 'xlink:xlink:href', (d) => '#' + markers.get( d.c.isNull ? 'missing' : d.c ) );

  };

});