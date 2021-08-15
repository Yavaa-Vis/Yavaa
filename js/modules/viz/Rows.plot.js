"use strict";
/**
 * actual plotting of a Row-Layout
 */
define( [], function(){

  return function( document, d3, data, param ) {

    // add some margin:
    param.margin = {
      top:    20,
      right:  20,
      bottom: 20,
      left:   80
    };

    // select svg
    const svg = d3.select( document )
                  .select( '#' + param.id )
                  .attr( 'viewBox', '0 0 ' + (param.width + param.margin.left + param.margin.right) + ' ' + (param.height + param.margin.top + param.margin.bottom) )
                .append("g")
                  .attr("transform", "translate(" + param.margin.left + "," + param.margin.top + ")");

    // vertical scale
    const y = d3.scaleBand()
                .range( [0, param.height] )
                .domain( data.domain.y )
                .paddingInner( 0.1 );

    // insert containers for each section
    const cont = svg.append( 'g' )
                      .attr( 'class', 'sections' )
                    .selectAll( 'g' )
                      .data( data.domain.y )
                    .enter().append( 'g' )
                      .attr( 'transform', (d) => `translate( 10 ${y(d)} )` )

    // insert a legend container
    svg.append( 'g' )
          .attr( 'id', 'legend' )
          .attr( 'transform', `translate( ${param.margin.left} ${param.height + param.margin.bottom} )` );

    // insert labels
    cont.append( 'text' )
          .text( (d) => d.toString() )
          .attr( 'x', -10 )
          .attr( 'y', y.step() / 2 )

    // insert SVG placeholders for the nexted visualizations
    // collect data for nested viz
    const nested = [],
          nestedHeight = y.step() - y.paddingInner() * y.step();
//    cont.append( 'rect' )
//          .attr( 'x', 0 )
//          .attr( 'y', y.paddingInner() * y.step() / 2 )
//          .attr( 'width', param.width )
//          .attr( 'height', nestedHeight  )
//          .style( 'fill', 'yellow' )
    cont.append( 'svg' )
          .attr( 'id', (d,i) => { const id = param.id + '_' + i; nested.push( id ); return id; } )
          .attr( 'x', 0 )
          .attr( 'y', y.paddingInner() * y.step() / 2  )
          .attr( 'width', param.width )
          .attr( 'height', nestedHeight )


    // insert separators
    cont.append( 'path' )
          .attr( 'd', (d) => `M 0,0 ${param.width},0` )
          .style( 'opacity', (d,i) => (i==0) ? 0 : 1 )
          .attr( 'class', 'separator' )

    // transfer settings for the nested viz back
    param._nested = {
      ids:    nested,
      width:  param.width,
      height: nestedHeight,
    };

  };

});