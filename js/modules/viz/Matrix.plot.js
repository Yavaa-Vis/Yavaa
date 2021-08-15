"use strict";
/**
 * actual plotting of a Matrix-Layout
 */
define( [], function(){

  return function( document, d3, data, param ) {

    // add some margin:
    param.margin = {
      top:    20,
      right:  20,
      bottom: 40,
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
                .domain( data.domain.rows )
                .paddingInner( 0.1 );

    // horizontal scale
    const x = d3.scaleBand()
                .range( [0, param.width] )
                .domain( data.domain.cols )
                .paddingInner( 0.1 );

    // build artificial dataset for sections
    const sections = [];
    for( let i=0; i<data.domain.rows.length; i++ ) {
      for( let j=0; j<data.domain.cols.length; j++ ) {
        sections.push({
          row: data.domain.rows[i],
          col: data.domain.cols[j],
          rowId: i,
          colId: j,
        });
      }
    }

    // insert containers for each row-section
    const cont = svg.append( 'g' )
                      .attr( 'class', 'sections' )
                    .selectAll( 'g' )
                      .data( sections )
                    .enter().append( 'g' )
                      .attr( 'transform', (d) => `translate( ${10 + x(d.col)} ${y(d.row)} )` )

    // insert a legend container
    svg.append( 'g' )
          .attr( 'id', 'legend' )
          .attr( 'transform', `translate( 0 ${param.height + param.margin.bottom} )` );

    // insert SVG placeholders for the nexted visualizations
    // collect data for nested viz
    const nested = [],
          nestedHeight = y.step() - y.paddingInner() * y.step(),
          nestedWidth  = x.step() - x.paddingInner() * x.step();
//    cont.append( 'rect' )
//          .attr( 'x', x.paddingInner() * x.step() / 2 )
//          .attr( 'y', y.paddingInner() * y.step() / 2 )
//          .attr( 'width',   nestedWidth )
//          .attr( 'height',  nestedHeight  )
//          .style( 'fill', 'yellow' )
    cont.append( 'svg' )
          .attr( 'id', (d,i) => { const id = param.id + '_' + i;
                                  nested.push({
                                    row: d.row,
                                    col: d.col,
                                    id:  id,
                                  });
                                  return id; } )
          .attr( 'x', x.paddingInner() * x.step() / 2 )
          .attr( 'y', y.paddingInner() * y.step() / 2  )
          .attr( 'width',  nestedWidth )
          .attr( 'height', nestedHeight )

    // insert labels (rows)
    cont.append( 'text' )
          .text( (d) => (d.colId==0) ? d.row.toString() : '' )
          .attr( 'x', -10 )
          .attr( 'y', y.step() / 2 )
    // insert labels (columns)
    cont.append( 'text' )
          .text( (d) => (d.rowId==0) ? d.col.toString() : '' )
          .attr( 'x', x.step() / 2 )
          .attr( 'y', -10 ) // param.height )

    // insert separators (row)
    cont.append( 'path' )
          .attr( 'd', (d) => `M 0,0 ${param.width + x.paddingInner() * x.step()},0` )
          .style( 'opacity', (d) => ((d.rowId==0) || (d.colId!=0)) ? 0 : 1 )
          .attr( 'class', 'separator' )
    // insert separators (column)
    cont.append( 'path' )
          .attr( 'd', (d) => `M 0,0 0,${param.height + y.paddingInner() * y.step()}` )
          .style( 'opacity', (d) => ((d.colId==0) || (d.rowId!=0)) ? 0 : 1 )
          .attr( 'class', 'separator' )

    // transfer settings for the nested viz back
    param._nested = {
      ids:    nested,
      width:  nestedWidth,
      height: nestedHeight,
    };

  };

});