"use strict";
/**
 * actual plotting of a Sunburst diagram
 * after https://bl.ocks.org/maybelinot/5552606564ef37b5de7e47ed2b7dc099
 */
define( [], function(){

  return function( document, d3, data, param ) {

    // add some margin:
    param.margin = {
      top:    20,
      right:  20,
      bottom: 20,
      left:   20
    };

    const radius = Math.min( param.width - param.margin.left - param.margin.right,
                             param.height - param.margin.top - param.margin.bottom ) / 2;

    // add scales, if not present
    if( !('_scales' in param) || !param._scales ) {

      const catDomain = param._domains[ param.hierarchy[0] ];
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
      ];

    }

    // scales
    const color = param._scales[0];

    // calc the center position
    const center = {
        x: param.margin.top  + (param.width - param.margin.left - param.margin.right) / 2,
        y: param.margin.left + (param.height - param.margin.top - param.margin.bottom) / 2,
    };

    // create container
    const svg = d3.select( document )
                  .select( '#' + param.id )
                    .attr('viewBox', `0 0 ${param.width} ${param.height}` )
                  .append("g")
                      .attr("transform", `translate( ${center.x} , ${center.y} )` );

    // build hierarchy
    const root = d3.hierarchy( data )
                   .sum( (d) => d.size );

    // init partitioning
    const partition = d3.partition();

    // scales
    const x = d3.scaleLinear()
                .range([0, 2 * Math.PI]);
    const y = d3.scaleSqrt()
                .range([0, radius]);

    // function to calculate arcs
    const arc = d3.arc()
                  .startAngle(  (d) => Math.max(0, Math.min(2 * Math.PI, x(d.x0))) )
                  .endAngle(    (d) => Math.max(0, Math.min(2 * Math.PI, x(d.x1))) )
                  .innerRadius( (d) => Math.max(0, y(d.y0)) )
                  .outerRadius( (d) => Math.max(0, y(d.y1)) );

    // create string for classes, if given
    const klass = ('classes' in param)
                      ? (param.classes instanceof Array) ? param.classes.join( ' ' ) : ('' + param.classes)
                      : '';

    // create segments
    const path = svg.datum(data).selectAll("path")
                      .data(partition(root).descendants())
                    .enter().append("path")
                    .attr("display", (d) => d.depth ? null : "none" ) // hide inner ring
                    .attr("d", arc)
                    .attr( 'data-yavaa', (d) => {
                      if( 'dataAttr' in param ) {
                        return JSON.stringify( d.data[ param.dataAttr ] );
                      }
                     })
                    .classed( klass, true )
                    .style("stroke", "#fff")
                    .style("fill", (d) => color( d.data.coloring ) );

  };

});