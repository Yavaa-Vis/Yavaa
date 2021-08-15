"use strict";
/**
 * actual plotting of a ViolinPlot
 */
define( [], function(){

  return function( document, d3, data, param ) {

    // add some margin:
    param.margin = {
      top: 20,
      right: 80,
      bottom: 30,
      left: 50
    };

    // collect all y-values
    const allValues = new Set();
    for( let i=0; i<data.length; i++ ) {

      // collect all values
      Object.keys( data[i].values )
            .forEach( (k) => {
               allValues.add( k );
            });
    }

    // try to guess step-width on y-axis
    const allValSorted = [ ... allValues ].map( k => parseFloat( k ) ).sort( (a,b) => a-b );
    let stepWidth = Number.POSITIVE_INFINITY;
    for( let i=1; i<allValSorted.length; i++ ) {
      stepWidth = Math.min( stepWidth, allValSorted[ i ] - allValSorted[ i-1 ] );
    }

    // convert data format
    const range = { // global min/max values
        xMin: 0,
        xMax: 0
      };
    for( let i=0; i<data.length; i++ ) {

      // min/max for this dataset
      const keys = Object.keys( data[i].values )
                         .map( (k) => parseFloat( k ) )
                         .sort( (a,b) => a-b );
      data[i].yMin = keys[0],
      data[i].yMax = keys[ keys.length - 1 ];

      // convert values object
      const values = [];
      for( let y=data[i].yMin; y<=data[i].yMax; y+= stepWidth) {
        if( y in data[i].values ) {
          values.push( { y: y, x: parseFloat( data[i].values[y]), parent: data[i] } );
        } else {
          values.push( { y: y, x: 0,                              parent: data[i] } );
        }
      }
      data[i].values = values;

      // store global min/max values
      range.xMin = Math.min( range.xMin, d3.min( values, (el) => el.x ) );
      range.xMax = Math.max( range.xMax, d3.max( values, (el) => el.x ) );

    }

    // add scales, if not present
    if( !('_scales' in param) || !param._scales ) {

      const yDomain   = param._domains[ param.val ],
            catDomain = param._domains[ param.cat ];
      let catValues = [];
      if( catDomain ) {
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
        d3.scaleBand()
          .range([0, param.width])
          .domain( catValues .sort() )
          .padding( 0.2 ),
        // x2-axis (per section)
        d3.scaleLinear()
          // range is set afterwards
          .domain([ 0, range.xMax ]),
        // y-axis
        d3.scaleLinear()
          .range([param.height, 0])
          .domain([ yDomain.min, yDomain.max ])
      ];
      param._scales[2].range( [0, param._scales[1].bandwidth() ] );

    }

    // scales
    const color = param._scales[0],
          x     = param._scales[1],
          x2    = param._scales[2],
          y     = param._scales[3];

    const area = d3.area()
                    .curve( d3.curveMonotoneY )
                    .y( (d) => y( d.y ) )
                    .x0( (d) => -x2( d.x ) / 2 )
                    .x1( (d) =>  x2( d.x ) / 2 )

    // axis
    const xAxis = d3.axisBottom()
        .scale(x);

    const yAxis = d3.axisLeft()
        .scale(y);

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
    svg.append('g')
        .attr('class', 'y axis')
        .call(yAxis)
      .append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', 6)
        .attr('dy', '.71em')
        .style('text-anchor', 'end')
        .text( param.title.yaxis );

    // <g> for each line
    const groups = svg.selectAll(".boxgroup")
                      .data(data)
                    .enter().append("g")
                      .attr("class", "boxgroup")
                      .attr( 'transform', (d) => 'translate(' + ( x( d.name ) + x.bandwidth() / 2 ) + ' 0)' )
                      .attr( 'data-yavaa', (d) => JSON.stringify( [ d.name ] ) );

    // the center line
    groups
      .append("line")
        .attr( "x1", 0 )
        .attr( "x2", 0 )
        .attr( "y1", (d) => y( d3.min( d.values, (el) => el.y ) ) )
        .attr( "y2", (d) => y( d3.max( d.values, (el) => el.y ) ) )
        .attr( "class", 'vert' )

    // the violin area
    groups
      .append( 'path' )
        .datum( (d) => d.values )
        .attr( 'd', area )
        .attr('class', 'violinArea')
        .style( 'fill',   (d) => color( d[0].parent.name ) )

  };

});