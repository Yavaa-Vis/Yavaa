'use strict';
/**
 * actual plotting of a Heatmap (categorical)
 */
define( [ 'viz/helper/colorRangeLegend' ], function( legend ){

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
                .append('g')
                  .attr('transform', 'translate(' + param.margin.left + ',' + param.margin.top + ')');

    // add scales, if not present
    if( !('_scales' in param) || !param._scales ) {

      const xDomain   = param._domains[ param.xaxis ],
            yDomain   = param._domains[ param.yaxis ],
            valDomain = param._domains[ param.value ];
      param._scales = [
        // color
        d3.scaleSequential( d3.interpolateRdYlGn )
          .domain( [ valDomain.min, valDomain.max ] ),
        // x-axis
        d3.scaleBand()
          .range( [ 0, param.width] )
          .domain( xDomain.list )
          .padding( 0 ),
        // y-axis
        d3.scaleBand()
          .range( [ 0, param.height ] )
          .domain( yDomain.list )
          .padding( 0 )
      ];

    }

    // scales
    const color = param._scales[0],
          x     = param._scales[1],
          y     = param._scales[2];

    // add legend
    if( !param._hideLegend ) {
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

    // x-axis
    svg.append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate(0,' + param.height + ')')
        .call(xAxis)
      .append('text')
        .attr('transform', `translate( ${param.width+10} 0 ) rotate(-90)` )
        .style('text-anchor', 'start')
        .style( 'fill', '#000' )
        .text( param.title.xaxis );

    // y-axis
    svg.append('g')
        .attr('class', 'y axis')
        .call(yAxis)
      .append('text')
        .attr('y', -3)
        .style('text-anchor', 'start')
        .style( 'fill', '#000' )
        .text( param.title.yaxis );

    // blocks
    svg.append( 'g' )
          .attr( 'class', 'blocks' )
        .selectAll( '.block' )
          .data( data.values )
        .enter().append( 'rect' )
          .attr( 'class', 'block' )
          .attr( 'x', (d) =>  x( d.x ) )
          .attr( 'y', (d) =>  y( d.y ) )
          .attr( 'width',   (d) => x.step() )
          .attr( 'height',  (d) => y.step() )
          .style( 'fill',   (d) => color( d.v ) )
          .attr( 'title', (d) => `${d.x} - ${d.y}` )

  };

});