'use strict';
/**
 * actual plotting of a BubbleChart
 *
 * TODO size of bubbles across multiple nested charts is not consistent
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
    const minDim = Math.min( param.width, param.height );

    const packer = d3.pack()
                     .size( [ minDim, minDim ] )

    // convert values to pack layout
    const root = d3.hierarchy( { children: data.values } )
                   .sum( (d) => d.s )
                   .sort( (a,b) => b.value - a.value )
    packer( root );

    // select svg
    const svg = d3.select( document )
                  .select( '#' + param.id )
                  .attr( 'viewBox', '0 0 ' + (param.width + param.margin.left + param.margin.right) + ' ' + (param.height + param.margin.top + param.margin.bottom) )
                .append('g')
                  .attr('transform', 'translate(' + param.margin.left + ',' + param.margin.top + ')');

    // add scales, if not present
    if( !('_scales' in param) || !param._scales ) {

      const nameDomain   = param._domains[ param.name ];
      let nameValues = nameDomain.list;
      if( nameDomain.hasNull ) {
        nameDomain = nameDomain.concat( [ 'missing' ] );
      }
      param._scales = [
        // color
        d3.scaleOrdinal( d3.schemeCategory10 )
          .domain( nameValues ),
      ];

    }

    // scales
    const color = param._scales[0];

    // bubbles
    const bubbles = svg.append( 'g' )
          .attr( 'class', 'bubbles' )
        .selectAll( '.bubble' )
          .data( root.children )
        .enter().append( 'g' )
          .attr( 'class', 'bubble' )

    // circles
    bubbles.append( 'circle' )
          .attr( 'cx', (d) => (param.width  - minDim) / 2 + d.x )
          .attr( 'cy', (d) => (param.height - minDim) / 2 + d.y )
          .attr( 'r',  (d) => d.r )
          .style( 'fill', (d) => color( d.data.n ) )

    // titles
    bubbles.append( 'title' )
          .text( (d) => d.data.n );

    // text
    bubbles.append( 'text' )
          .text( (d) => d.data.n )
          .attr( 'x', (d) => (param.width  - minDim) / 2 + d.x )
          .attr( 'y', (d) => (param.height - minDim) / 2 + d.y )

  };

});