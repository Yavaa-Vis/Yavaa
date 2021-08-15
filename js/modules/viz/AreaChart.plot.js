'use strict';
/**
 * actual plotting of a AreaChart
 */
define( [], function(){

  return function( document, d3, data, param ) {

    // add some margin:
    param.margin = {
      top:    20,
      right:  80,
      bottom: 30,
      left:   50
    };

    // scales
    const x = d3.scaleLinear()
                .range([0, param.width]);

    const y = d3.scaleLinear()
                .range([param.height, 0]);

    // domains
    x.domain( d3.extent( data, (d) => d.d ) );
    y.domain([ 0, d3.max( data, (d) => d.v ) ]);

    // axes
    const xAxis = d3.axisBottom( x ),
          yAxis = d3.axisLeft( y );

    // tick-rendering
    if( param.isTimeAxis ) {
      xAxis.tickFormat( d3.format( 'd' ) );
    }

    // actual area
    const area = d3.area()
                    .curve( d3.curveMonotoneX )
                    .y1( (d) => y(d.v) )
                    .y0( param.height )
                    .x( (d) => x(d.d) )

    // select svg
    const svg = d3.select( document )
                  .select( '#' + param.id )
                  .attr( 'viewBox', '0 0 ' + (param.width + param.margin.left + param.margin.right) + ' ' + (param.height + param.margin.top + param.margin.bottom) )
                .append('g')
                  .attr('transform', 'translate(' + param.margin.left + ',' + param.margin.top + ')');

    // <g> for the area
    const areas = svg.selectAll('.areagroup')
                        .data( [data.filter( (el) => !el.v.isNull )] )
                      .enter().append('g')
                        .attr('class', 'areagroup');

    // the area
    areas
      .append( 'path' )
        .attr( 'd', area )
        .attr( 'class', 'area' )
        .style( 'fill', 'steelblue' )

    // x-axis
    svg.append('g')
        .attr( 'class',     'x axis')
        .attr( 'transform', `translate(0,${param.height})` )
        .call( xAxis );

    // y-axis
    svg.append( 'g' )
        .attr( 'class', 'y axis' )
        .call( yAxis )
      .append( 'text' )
        .attr( 'transform', 'rotate(-90)' )
        .attr( 'y', 6 )
        .attr( 'dy', '.71em' )
        .style( 'text-anchor', 'end')
        .style( 'fill', 'currentColor' )
        .text( param.title.yaxis )

  };

});