"use strict";
/**
 * actual plotting of a LineChart
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

    const color = d3.scaleOrdinal( d3.schemeCategory10 );

    // axes
    const xAxis = d3.axisBottom( x ),
          yAxis = d3.axisLeft( y );

    // x-axis bound to a time column?
    const isXTime = (param._domains[ param.xaxis ].min._type == 'TimeInstant');

    // actual line
    const line = d3.line()
        .curve( d3.curveMonotoneX )
        .x((d) => x(d.d) )
        .y((d) => y(d.v) );

    // select svg
    const svg = d3.select( document )
                  .select( '#' + param.id )
                  .attr( 'viewBox', '0 0 ' + (param.width + param.margin.left + param.margin.right) + ' ' + (param.height + param.margin.top + param.margin.bottom) )
                .append("g")
                  .attr("transform", "translate(" + param.margin.left + "," + param.margin.top + ")");

    // parse date objects
    const range = {
        xMin: Number.POSITIVE_INFINITY,
        xMax: Number.NEGATIVE_INFINITY,
        yMin: Number.POSITIVE_INFINITY,
        yMax: Number.NEGATIVE_INFINITY
    };
    for( let i=0; i<data.length; i++ ) {

      data[i].values = data[i].values
                              .filter( (el) => ('v' in el) && (el.v != null) )
                              .map( ( el ) => {

                                // convert value to number
                                const v = parseFloat( el.v );

                                // min/max values
                                range.xMin = range.xMin < el.d ? range.xMin : el.d;
                                range.xMax = range.xMax > el.d ? range.xMax : el.d;
                                range.yMin = range.yMin < v ? range.yMin : v;
                                range.yMax = range.yMax > v ? range.yMax : v;

                                return {
                                  v: v,
                                  d: isXTime ? el.d : parseFloat( el.d ),
                                };
                              });

    }
    // consider only value-sets with actual values
    data = data.filter( (d) => d.values.length > 0 );

    // domains
    color.domain( data.map( function( el ){ return el.name; } ) );
    x.domain( isXTime ? [ range.xMin, range.xMax ] : [ parseFloat( range.xMin ), parseFloat( range.xMax ) ] );
    y.domain([ Math.min( 0, range.yMin ), Math.max( range.yMax ) ]);

    // set formatter for x-axis
    if( isXTime ) {

      // time, so we display as is (not additional formatting)
      xAxis.tickFormat( d3.format("d") );

      // hack to prevent duplicate entries;
      // TODO improve prevention of duplicates
      const values = [];
      for( let i=range.xMin; i<=range.xMax; i++ ){
        values.push( i );
      }
      xAxis.tickValues( values );

    } else {

      // number, so the default formatter is just fine

    }

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

    // <g> for each line
    const lines = svg.selectAll(".linegroup")
        .data(data)
      .enter().append("g")
        .attr("class", "linegroup");

    // the line
    lines.append("path")
        .attr("class",    "line")
        .attr("d",        (d) => line(d.values) )
        .style("stroke",  (d) => color(d.name) );

    // the line description
    lines.append("text")
        .datum( (d) => { return {name: d.name, value: d.values[d.values.length - 1]}; })
        .attr( 'class', 'lineLabel' )
        .attr( "transform", (d) => `translate(${x(d.value.d)},${y(d.value.v)})` )
        .attr( "x", 3 )
        .attr( "dy", ".35em" )
        .style( 'fill', 'currentColor' )
        .text( (d) => d.name );
  };

});