"use strict";
/**
 * show data table
 */
define( [ 'jquery',
          'datatables',
          'scroller',
          'ui/basic/Yavaa.global',
          'ui/views/_common/colCtxMenu'
          ],
function( $,
          datatables,
          scroller,
          Y,
          colCtxmenu
          ){

  // data table
  let $table;

  // currently shown dataset
  let curDataset    = null,
      curDatasetID  = -1,
      curMeta       = null;


  /**
   * callback function for table generation
   *
   * can not be async or datatable will crash
   */
  function getData( opt, cb, settings ) {

    // request data
    const dataReq = Y.CommBroker
                     .execCommand({
                        'action': 'getData',
                        'params': {
                          'data_id': curDataset.getDataID(),
                          'start': opt['start'],
                          'entries': opt['length']
                        }
                     });

    // request meta
    const metaReq = curDataset.getMeta();

    // wait for data to arrive
     Promise.all( [dataReq, metaReq] )
       .then( ([data, meta]) => {

         // enforce a maximum length for all cells
         const tableData = data['params']['data']
                             .map( (row) => row.map( (c) => {

                                     // null objects
                                     if( !c ) { return c; }

                                     // limit all others in size
                                     c = '' + c;
                                     if( c.length > 100 ) {
                                       return c.substring( 0, 100 ) + ' ...';
                                     } else {
                                       return c;
                                     }

                                   })
                             );

         // execute the callback
         cb({
           'draw':            opt['draw'],
           'data':            tableData,
           'recordsTotal':    meta['entries'],
           'recordsFiltered': meta['entries']
         })

       })
       .catch( (e) => console.log(e) );

  }


  /*
   * create table for the data view
   */
  async function showData( target, ds, forceUpdate ) {

    // sometimes there is just nothing to do
    if( (curDatasetID == ds.getDataID()) && !forceUpdate ) {
      return;
    }

    // set current dataset
    curDataset = ds;
    curDatasetID = ds.getDataID();

    // clear old table
    $table = $( '<table></table>' );
    $( target ).html( $table );

    // get meta data about current dataset
    const cols = await ds.getColumnMeta();

    // convert column desc
    const header = [];
    for( let i=0; i<cols.length; i++ ) {
      header.push({
        'title':      cols[i].getLabel(),
        'col':        cols[i],
        'sortable':   false,
        'orderable':  false
      });
    }

    // init table
    const oTable = $table.DataTable({
      'deferRender':  true,
      'dom':          'rtS',
      'scrollX':      '100%',
      'scrollY':      $('#content').height() + 'px',
      'serverSide':   true,
      'processing':   true,
      'ajax':         getData,
      'order':        [],
      'columns':      header,
      'initComplete': function( settings ){
        // hack?

        // adjust size of scroll block
        const $wrapper = $(this).closest( '.dataTables_wrapper' );
        $wrapper.find( '.dataTables_scrollBody' )
                .css( 'height',
                      'calc( 100% - ' + $wrapper.find( '.dataTables_scrollHead' ).css('height') + ')' );

      },
      'headerCallback': function( thead, data, start, end, display ) {

        // attach the col object to the column header cell
        oTable.columns().iterator( 'column', function ( settings, column ) {
          $( oTable.column(column).header() ).data( 'col', settings.aoColumns[ column ].col );
        });

      }
    });

    // add context menu to head row
    colCtxmenu( target, '.dataTable th, .dataTable td', curDataset, cols, oTable );

    // store a link to the datatable instance
    $( target ).data( 'datatable', oTable );

  }


  /**
   * reset the workflow view
   */
  async function resetViewData( target ){
    $( target ).empty();
    $( target ).removeData( 'datatable' ); 
  }


  return { show: showData, reset: resetViewData };

});
