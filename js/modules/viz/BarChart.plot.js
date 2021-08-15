"use strict";
/**
 * actual plotting of a BarChart
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
                .append("g")
                  .attr("transform", "translate(" + param.margin.left + "," + param.margin.top + ")");

    // add scales, if not present
    if( !('_scales' in param) || !param._scales ) {

      const yDomain  = param._domains[ param.yaxis ],
            xDomain  = param._domains[ param.xaxis ],
            multDomain = param._domains[ param.mult ];
      let   multValues = [];
      if( (typeof multDomain != 'undefined') ) {
        multValues = multDomain.list;
        if( multDomain.hasNull ) {
          multValues = multValues.concat( [ 'missing' ] );
        }
      }
      param._scales = [
        // color
        d3.scaleOrdinal( d3.schemeCategory10 )
          .domain( multValues.sort() ),
        // x1-axis
        d3.scaleBand()
          .range( [0, param.width] )
          .domain( xDomain.list.sort() )
          .padding( 0.2 ),
        // x2-axis
        d3.scaleBand()
          // range set afterwards
          .domain( multValues )
          .padding( 0 ),
        // y-axis
        d3.scaleLinear()
          .range( [ param.height, 0 ] )
          .domain( [ Math.min( 0, yDomain.min), Math.max( 0, yDomain.max ) ] ),
      ];
      param._scales[2].range( [ 0, param._scales[1].bandwidth() ] );

    }

    // scales
    const color = param._scales[0],
          x     = param._scales[1],
          x2    = param._scales[2],
          y     = param._scales[3];

    // append legend
    if( !param._hideLegend && (color.domain().length > 0) ) {
      const legendContainer = svg.append( 'g' ).attr( 'id', 'legend' ),
            legendHeight    = legend( document, d3, '#legend', param.width, color );
      param.height -= legendHeight;
      legendContainer.attr( 'transform', `translate( 0 ${param.height + param.margin.bottom} )` );

      // adjust y-scale
      y.range( [ param.height, 0 ] );
    }

    // axes
    const xAxis = d3.axisBottom( x ),
          yAxis = d3.axisLeft( y );

    // x-axis
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + param.height + ")")
        .call(xAxis);

    // y-axis
    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
      .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text( param.title.yaxis );

    // <g> for each box group
    const entries = svg.selectAll(".boxgroup")
        .data( data.entries )
      .enter().append("g")
        .attr("class", "boxgroup")
        .attr( 'transform', (d) => `translate( ${x2(d.label) || 0} ${param.height} )` )

    // the boxes
    entries
      .selectAll("rect")
        .data( (d) => d.values )
      .enter().append( 'rect' )
        .attr( "class",    "box")
        .attr( "x",        (d) => x( d.x ) )
        .attr( "y",        (d) => -param.height + y( d.y ) )
        .attr( 'height',   (d) =>  param.height - y( d.y ) )
        .attr( 'width',    (d) => x2.step() )
        .style( "fill",    (d) => color(d.label) );

  };

});