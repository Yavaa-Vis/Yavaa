"use strict";
/**
 * actual plotting of a BoxPlot
 */
define( [], function(){

  return function( document, d3, data, param ) {

    // add some margin:
    param.margin = {
      top: 20,
      right: 30,
      bottom: 30,
      left: 50
    };

    // add scales, if not present
    if( !('_scales' in param) || !param._scales ) {

      const xDomain   = param._domains[ param.cat ],
            yDomain   = param._domains[ param.val ];
      param._scales = [
        // x-axis
        d3.scaleBand()
          .range([0, param.width])
          .domain( xDomain.list.sort() )
          .padding( 0.2 ),
        // y-axis
        d3.scaleLinear()
          .range([param.height, 0])
          .domain([ yDomain.min, yDomain.max ])
      ];

    }

    // scales
    const x = param._scales[0],
          y = param._scales[1];

    // axis
    const xAxis = d3.axisBottom( x ),
          yAxis = d3.axisLeft( y );

    // select svg
    const svg = d3.select( document ).select( '#' + param.id )
                  .attr( 'viewBox', '0 0 ' + (param.width + param.margin.left + param.margin.right) + ' ' + (param.height + param.margin.top + param.margin.bottom) )
                .append("g")
                  .attr("transform", "translate(" + param.margin.left + "," + param.margin.top + ")");

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
        // .text( param.title.yaxis );

    // <g> for each line
    const groupes = svg.selectAll(".boxgroup")
                      .data(data)
                    .enter().append("g")
                      .attr("class", "boxgroup");

    // get some reusable values
    const rangeWidth = x.bandwidth();

    // the center line
    groupes.append("line")
        .attr(  "x1", (d) => x( d.name ) + rangeWidth/2 )
        .attr(  "x2", (d) => x( d.name ) + rangeWidth/2 )
        .attr(  "y1", (d) => y( d.values[0] ) )
        .attr(  "y2", (d) => y( d.values[1] ) )
        .attr(  "class", 'vert' );
    groupes.append("line")
        .attr(  "x1", (d) => x( d.name ) + rangeWidth/2 )
        .attr(  "x2", (d) => x( d.name ) + rangeWidth/2 )
        .attr(  "y1", (d) => y( d.values[3] ) )
        .attr(  "y2", (d) => y( d.values[4] ) )
        .attr(  "class", 'vert' );

    // the maximum line
    groupes.append("line")
        .attr(  "x1", (d) => x( d.name ) )
        .attr(  "x2", (d) => x( d.name ) + rangeWidth )
        .attr(  "y1", (d) => y( d.values[4] ) )
        .attr(  "y2", (d) => y( d.values[4] ) )
        .attr(  "class", 'horiz' );

    // the minimum line
    groupes.append("line")
        .attr(  "x1", (d) => x( d.name ) )
        .attr(  "x2", (d) => x( d.name ) + rangeWidth )
        .attr(  "y1", (d) => y( d.values[0] ) )
        .attr(  "y2", (d) => y( d.values[0] ) )
        .attr(  "class", 'horiz' );

    // center quartiles box
    groupes.append( 'rect' )
        .attr( 'x',       (d) => x( d.name ) )
        .attr( 'y',       (d) => y( d.values[3] ) )
        .attr( 'height',  (d) => y( d.values[1] ) - y( d.values[3] ) )
        .attr( 'width',   rangeWidth )
        .attr( 'class',   'box' );

    // the median line
    groupes.append("line")
        .attr(  "x1", (d) => x( d.name ) )
        .attr(  "x2", (d) => x( d.name ) + rangeWidth )
        .attr(  "y1", (d) => y( d.values[2] ) )
        .attr(  "y2", (d) => y( d.values[2] ) )
        .attr(  "class", 'horiz' );
  };

});