"use strict";
/*
 * provide the interface for a entity-based filtering of a column
 */
define( ['jquery',
         'jquery-ui',
         'ui/basic/Yavaa.global',
         'text!template/ui/dialog/filter/EntityFilter.htm',
         'text!template/ui/dialog/filter/EntityFilter_item.htm',
         'text!template/ui/common/value.htm',
         'ui/basic/Overlay'
         ],
function( $,
    jqueryUI,
    Y,
    templ,
    templItem,
    templValue,
    Overlay
){

  // prepare content
  const $content = $( templ );

  // link to important elements
  const $els = {
      include: $content.find( '[data-filter="include"]'),
      exclude: $content.find( '[data-filter="exclude"]')
  };

  // prepare regexp
  const regexp = {
      label:    /{label}/gi,
      classes:  /{classes}/gi,
      uri:      /{uri}/gi,
  };


  /**
   * @param   {jQuery}    dialogContainer     the container element, where to put the content
   * @param   {Dataset}   ds                  the currently active dataset
   * @param   {Number}    cold                the column to be filtered
   * @returns
   */
  function EntityFilter( dialog, dialogContainer, ds, col ) {

    // save parameters
    this._dialog = dialog;
    this._dialogContainer = dialogContainer;
    this._ds = ds;
    this._col = col;

  }


  /**
   * initialize
   */
  EntityFilter.prototype.init = async function init(){

    // set base content
    this._dialogContainer.html( $content );

    // activate overlay
    const overlay = new Overlay( $els.include );

    // fill the column list
    const values = await this._col.getColumnValues();

    // sort the values
    values.list.sort( (a,b) => a.label.localeCompare( b.label ) );

    // build items
    const $items = [];
    for( let i=0; i<values.list.length; i++ ) {
      const el = templValue.replace( regexp.label,    values.list[i].label )
                           .replace( regexp.classes,  '' )
                           .replace( regexp.uri,      values.list[i].uri ),
            $el = $(el);
      $el.attr( 'draggable',  'true' );
      $el.data( 'value',      values.list[i] );
      $items.push( $el );
    }

    // empty both drop areas
    $els.include.html( '' );
    $els.exclude.html( '' );

    // insert into "include" column
    $els.include.append( $items );

    // attach all necessary handlers
    initContent( this, $content );

    // enable/disable buttons
    this._afterChange();

    // remove overlay
    overlay.remove();

  }


  /**
   * is the current result really a filter to apply?
   * (in contrast to a filter, which has no effect)
   */
  EntityFilter.prototype.hasEffect = function(){

    // it will have some effect, if there is at least one child to exclude
    return $els.exclude.children().length > 0;

  }


  /**
   * return the respective filter command for the current settings
   */
  EntityFilter.prototype.getFilterRule = function(){

    // get value of selection (inclusion vs exclusion)
    const select = $('input[name="filter_select"]:checked').val();

    // determine type of filter and get the respective container
    let $cont, includeFilter;
    switch( select ) {
      case 'include': includeFilter = true;  $cont = $els.include; break;
      case 'exclude': includeFilter = false; $cont = $els.exclude; break;
      default: throw new Error( 'Unknown filter type: ' + select ); return;
    }

    // return values
    $cont = $cont.find( '[draggable="true"]' );
    const vals = [];
    for( let i=0; i<$cont.length; i++ ) {

      // shortcut
      const $el = $cont.eq( i );

      // include the value
      vals.push( $el.data( 'uri' ) );

    }

    // return filter rule
    return {
        'operator': 'EntityFilter',
        'include':  includeFilter,
        'column':   this._col.getID(),
        'values':   vals
    };
  }


  /**
   * enable or disable the apply button after each change
   */
  EntityFilter.prototype._afterChange = function afterChange(){

    if( this.hasEffect() ) {
      this._dialog.setDisabled( 'Apply', false );
    } else {
      this._dialog.setDisabled( 'Apply', true );
    }

  }

  return EntityFilter;


  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX init XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  /**
   * init all handlers for the drag and drop
   */
  function initContent( self, $base ){

    const draggables = $('[draggable=true]'),
          dropzones = $('.dropzone');
    let draggedEl = null;

    draggables.each(function (ind, el) {
        var $el = $(el);
        $el.data('filter', $el.parent().data('filter'));
    });

    draggables.on('dragstart', function (evt) {
        evt.originalEvent.dataTransfer.setData('text', 'dragging');
        draggedEl = $(this);
    });

//    draggables.on('drag', function (evt) {});
//    draggables.on('dragend', function (evt) {});

    dropzones.on('dragover', function (evt) {
        const $this = $(this);
        if( this && draggedEl && ($this.data('filter') != draggedEl.data('filter')) ) {
            $this.addClass('valid');
        }
        evt.preventDefault();
    });
    dropzones.on('dragenter', function (evt) {
        const $this = $(this);
        if( this && draggedEl && ($this.data('filter') != draggedEl.data('filter')) ) {
            $this.addClass('valid');
        }
        evt.preventDefault();
    });

    dropzones.on('dragleave', function (evt) {
        $(this).removeClass('valid');
    });

    dropzones.on('drop', function (evt) {
        // evt.originalEvent.dataTransfer.getData('text')
        evt.preventDefault();
        const $this = $(this);
        if (this && draggedEl && ($this.data('filter') != draggedEl.data('filter'))) {
            $(this).removeClass('valid');
            draggedEl.data('filter', $(this).data('filter'));
            insertElement( $this, draggedEl );
        }
        draggedEl = null;

        // update buttons
        self._afterChange();
    });

    // event handler for batch operations
    $('.batch').on('click', function () {

        // shortcut
        var $this = $(this);

        // get options
        const direction = $this.data( 'target' ),
              all = $this.data( 'all' ) == 'true';

        // get base and target selection
        var base, target;
        if( direction == 'include' ) {
          base = dropzones.filter( '[data-filter="exclude"]' );
          target = dropzones.filter( '[data-filter="include"]' );
        } else {
          base = dropzones.filter( '[data-filter="include"]' );
          target = dropzones.filter( '[data-filter="exclude"]' );
        }

        // get the respective child lists
        const baseChilds = base.children( '[draggable="true"]' ),
              targetChilds = target.children( '[draggable="true"]' );

        // special case: one selection is empty
        if( baseChilds.length < 1 ) {
          self._afterChange();
          return;
        }
        if( targetChilds.length < 1 ) {
          baseChilds.data('filter', target.data('filter') )
                    .appendTo( target );
          self._afterChange();
          return;
        }

        // running indexes
        var baseInd = 0,
            targetInd = 0;

        // merge part 1: all base elements before an target elements
        while( (baseInd < baseChilds.length) && ( targetInd < targetChilds.length ) ) {

            // check, if we can insert an element
            if( baseChilds.eq( baseInd ).text().localeCompare( targetChilds.eq( targetInd ).text() ) <= 0) {
                baseChilds.eq( baseInd )
                        .data('filter', target.data('filter') )
                        .insertBefore( targetChilds.eq( targetInd ) );
                baseInd += 1;
            } else {
                targetInd += 1;
            }
        }

        // merge part 2: append the rest to the list
        for( ; baseInd < baseChilds.length; baseInd++ ) {
          baseChilds.eq( baseInd )
                    .data('filter', target.data('filter') )
                    .appendTo( target );
        }

        // update buttons
        self._afterChange();

    });
  }


  /**
   * insert the given element into the list within $target
   */
  function insertElement( $target, $el ) {

      // get all sub-elements below current target
      var $els = $target.find( '[draggable=true]' );

      // if this is the first, just insert
      if( $els.length < 1 ) {
          $target.append( $el );
          return;
      }

      // get the element immediately before ours
      var position = findPosition( $els, 0, $els.length-1, $el.text() );

      // insert element
      var $neighbour = $( $els.get( position ) );
      if( $neighbour.text() < $el.text() ) {
          $el.insertAfter( $neighbour );
      } else {
          $el.insertBefore( $neighbour );
      }
  }

  /**
   * find a direct neighbor in $list in the given range for the given needle
   */
  function findPosition( $list, start, end, needle ) {
      // we found the direct neighbour
      if( start == end ) {
          return start;
      }

      // take pivot
      var pivotInd = start + Math.floor( (end-start) / 2 ),
          pivot = $( $list.get( pivotInd ) );

      // where to look further
      if( pivot.text().localeCompare( needle ) > 0 ) {
          return findPosition( $list, start, pivotInd, needle );
      } else {
          return findPosition( $list, pivotInd + 1, end, needle );
      }
  }
});

/* http://jsfiddle.net/a4hrghum/6/ */