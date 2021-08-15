/**
 * check the basic functionality of store/viz/suggestExact
 */
define( [ 'basic/Constants',
          'store/viz/suggestExact',
          'store/data',
          'testing/createDataset',
          'util/requirePromise',
        ],
function( Constants,
          suggestExact,
          DataStore,
          createDataset,
          requireP
         ){

  return async function( QUnit ) {

    QUnit.module( 'store/viz: suggestExact' );

    // 1 dim (quant) + 1 meas (quant)
    const testId_dq_mq = await createDataset({
                          columns: [{
                            "role" :      Constants.ROLE.DIM,
                            "datatype":   Constants.DATATYPE.NUMERIC,
                            "desc":       "col1",
                              
                            values:   10,
                          },{
                            "role" :      Constants.ROLE.MEAS,
                            "datatype":   Constants.DATATYPE.NUMERIC,
                            "desc":       "col2",
                              
                            values:   10,
                          }]
                        }),
        test_dq_mq = DataStore.getDataset( testId_dq_mq );
    createTest( QUnit, test_dq_mq, {
      whitelist: ['LineChart'],
      blacklist: ['BoxPlot'],
    });

    // 1 dim (semantic) + 1 meas (quant)
    const testId_dc_mq = await createDataset({
                          columns: [{
                            "role" :      Constants.ROLE.DIM,
                            "datatype":   Constants.DATATYPE.SEMANTIC,
                            "desc":       "col1",
                              
                            values:   10,
                          },{
                            "role" :      Constants.ROLE.MEAS,
                            "datatype":   Constants.DATATYPE.NUMERIC,
                            "desc":       "col2",
                              
                            values:   10,
                          },
                          ]
                        }),
        test_dc_mq = DataStore.getDataset( testId_dc_mq );
    createTest( QUnit, test_dc_mq, {
      whitelist: ['BoxPlot'],
      blacklist: ['LineChart'],
    });

    // 2 dim (semantic,quant) + 1 meas (quant)
    const testId_dcq_mq = await createDataset({
                          columns: [{
                            "role" :      Constants.ROLE.DIM,
                            "datatype":   Constants.DATATYPE.SEMANTIC,
                            "desc":       "col1",
                              
                            values:   10,
                          },{
                            "role" :      Constants.ROLE.DIM,
                            "datatype":   Constants.DATATYPE.NUMERIC,
                            "desc":       "col2",
                              
                            values:   10,
                          },{
                            "role" :      Constants.ROLE.MEAS,
                            "datatype":   Constants.DATATYPE.NUMERIC,
                            "desc":       "col3",
                              
                            values:   10,
                          },
                          ]
                        }),
        test_dcq_mq = DataStore.getDataset( testId_dcq_mq );
    createTest( QUnit, test_dcq_mq, {
      whitelist: ['LineChart'],
      blacklist: ['BoxPlot'],
    });


    // 3 dim (semantic,semantic[1],quant) + 1 meas (quant)
    // semantic column with just one value should be ignored
    const testId_dccq_mq = await createDataset({
                          columns: [{
                            "role" :      Constants.ROLE.DIM,
                            "datatype":   Constants.DATATYPE.SEMANTIC,
                            "desc":       "col1",
                              
                            values:   3,
                          },{
                            "role" :      Constants.ROLE.DIM,
                            "datatype":   Constants.DATATYPE.SEMANTIC,
                            "desc":       "col2",
                              
                            values:   1,
                          },{
                            "role" :      Constants.ROLE.DIM,
                            "datatype":   Constants.DATATYPE.NUMERIC,
                            "desc":       "col3",
                              
                            values:   10,
                          },{
                            "role" :      Constants.ROLE.MEAS,
                            "datatype":   Constants.DATATYPE.NUMERIC,
                            "desc":       "col4",
                              
                            values:   10,
                          },
                          ]
                        }),
        test_dccq_mq = DataStore.getDataset( testId_dccq_mq );
    createTest( QUnit, test_dccq_mq, {
      whitelist: ['LineChart', 
                  { layout: 'Rows', nested: 'LineChart' },
                 ],
      blacklist: ['BoxPlot'],
    });
  }


  /**
   * commence one testset
   * @param {Object}    QUnit             the QUnit test handler
   * @param {Object}    ds                the testing dataset
   * @param {Object}    cfg               configure white- and blacklist items for the result
   * @param {Array}     cfg.whitelist     names of visualizations that should be in the result
   * @param {Array}     cfg.blacklist     names of visualizations that NOT should be in the result
   */
  function createTest( QUnit, ds, cfg ) {

    // create test title
    const title = ds.getColumnMeta()
                    .map( (col) => {
                      return '('
                              + (col.isDimension() ? 'dim; ' : 'meas; ' )
                              + col.getDatatype()
                              + ')'
                    })
                    .join( ' | ' );
    
    // start test
    QUnit.test( title, async function( assert ){

      // async test
      const done = assert.async();

      try {
      
        // find list of matching visualizations
        const viz = await suggestExact( ds );

        // the result should be an desc-ordered array
        assert.ok( viz instanceof Array, 'result should be an array' );
        let ordered = true;
        for( let i=1; i<viz.length; i++ ) {
          if( viz[i].binding.score < viz[i-1].binding.score ) {
            ordered = false;
            break;
          }
        }
        assert.ok( ordered, 'array should be ordered in descending order' );

        // some types should be in there
        if( 'whitelist' in cfg ) {
          for( let whiteItem of cfg.whitelist ) {
            
            // nested viz?
            const nestedViz = typeof whiteItem != 'string';

            // a matching binding has to exist
            let binding;
            if( !nestedViz ) {
              binding = viz.find( el => el.id == whiteItem );
            } else {
              binding = viz.find( el => (el.id.layout == whiteItem.layout) && (el.id.nested == whiteItem.nested) );
            }
            assert.ok( !!binding, nestedViz
                                    ? `${whiteItem.layout}[${whiteItem.nested}] should be in the results`
                                    : `${whiteItem} should be in the results` );
            if( !binding ) {
              continue;
            }

            // check, that all mandatory fields are bound
            if( !nestedViz ) {
              
              const desc = await requireP( `viz/${whiteItem}.desc` );
              checkMandatory( assert, whiteItem, binding, binding.id, binding.bindingId, desc );
              
            } else {

              const descs = await requireP( [ `viz/${whiteItem.layout}.desc`, 
                                              `viz/${whiteItem.nested}.desc` ] );
              const name = `${whiteItem.layout}[${whiteItem.nested}]`;
              checkMandatory( assert, name, binding, binding.id.layout, binding.bindingId.layout, descs[0] );
              checkMandatory( assert, name, binding, binding.id.layout, binding.bindingId.nested, descs[1] );

            }

          }
        }

        // some types should NOT be in there
        if( 'blacklist' in cfg ) {
          for( let i=0; i<cfg.blacklist.length; i++ ) {
            assert.notOk( !!viz.find( el => el.id == cfg.blacklist[i] ), cfg.blacklist[i] + ' should NOT be in the results' );
          }
        }
            
      } catch( e ) {
        
        console.log(e);
        assert.ok( false, 'error while executing test' );
      }
      

      // we are done
      done();

    });
  }
  
  
  /**
   * validate that all mandatory fields are bound
   */
  function checkMandatory( assert, name, bindingDesc, bindingName, bindingId, desc ) {
    
    // shortcut(s)
    const binding = bindingDesc.binding.binding;

    // check columns
    for( let col of desc[bindingId].columnBinding ) {
      if( !col.optional && (col.datatype != Constants.VIZDATATYPE.VISUALIZATION) ) {
        assert.ok( col.id in binding, `${name}: ${bindingName}.${col.id} should be bound.` );
      }
    }
    
  }

});