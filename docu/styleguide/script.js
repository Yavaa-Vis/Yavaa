"use strict";
$( document )
  .ready( () => {
    
    // grab all headings
    const $headings = $( 'h1, h2, h3, h4, h5, h6, h7' );
    
    // build hierarchy
    const root = { children: [] };
    let runner = root,
        curHier = [];
    for( let i=0; i<$headings.length; i++ ) {
      
      // shortcut
      let $el = $headings.eq( i );
      
      // get level of heading
      let level = parseInt( $el.prop( 'tagName' ).replace( 'H', '' ), 10 ) - 1;

      // create entry
      let entry = {
          el: $el,
          children: []
      };
      
      // update current hierarchy
      curHier[ level ] = entry;
      curHier.fill( null, level + 1 );
      
      // add to parent's children
      if( level > 0 ) {
        curHier[ level-1 ].children.push( entry );
      } else {
        root.children.push( entry );
      }
      
    }
    
    // convert to nav list
    let headIndex = 0;
    $( 'nav' ).append( createUL( root.children ) );
        
    /**
     * create an <ul> list for the given list
     */
    function createUL( list ) {
      
      // one node per child
      let $children = [];
      for( let i=0; i<list.length; i++ ) {
        
        // shortcuts
        let entry = list[i],
            id    = 'head' + headIndex++;
        
        // add id to element
        entry.el.attr( 'id', id );
        
        // basic entry
        let $entry = $( '<li />' ),
            $link  = $( '<a />' );
        $entry.append( $link );
        $link.text( entry.el.text() );
        $link.attr( 'href', '#' + id );
        
        // if it has children, add them
        if( entry.children.length > 0 ) {
          $entry.append( createUL( entry.children ) );
        }
        
        // add to result
        $children.push( $entry );
        
      }
      
      // collect all in one list
      let $res = $( '<ul />' );
      $res.append( $children );
      
      // done
      return $res;
    }
  });
