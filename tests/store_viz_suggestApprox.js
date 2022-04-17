/**
 * check the basic functionality of store/viz/suggestApprox
 */
define( [ 'basic/Constants',
          'store/viz/suggestApprox',
          'store/viz/suggestExact',
          'store/data',
          'testing/createDataset',
          'util/requirePromise',
        ],
function( Constants,
          suggestApprox,
          suggestExact,
          DataStore,
          createDataset,
          requireP
         ){

  return async function( QUnit ) {

    QUnit.module( 'store/viz: suggestApprox' );

    // 2 dim (semantic,quant) + 2 meas (quant)
    // semantic column with just one value should be ignored
    const testId_dccq_mq = await createDataset({
                          columns: [{
                            "role" :      Constants.ROLE.DIM,
                            "datatype":   Constants.DATATYPE.SEMANTIC,
                            "desc":       "col1",

                            values:   3,
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
        const viz       = await suggestApprox( ds ),
              exactViz  = await suggestExact( ds );   // we also compare against the exact suggestions

        // the result should be an desc-ordered array
        assert.ok( viz.suggestion instanceof Array, 'result should be an array' );
        let ordered = true;
        for( let i=1; i<viz.suggestion.length; i++ ) {
          if( viz.suggestion[i].binding.score < viz.suggestion[i-1].binding.score ) {
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
              binding = viz.suggestion.find( el => el.id == whiteItem );
            } else {
              binding = viz.suggestion.find( el => (el.id.layout == whiteItem.layout) && (el.id.nested == whiteItem.nested) );
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
            assert.notOk( !!viz.suggestion.find( el => el.id == cfg.blacklist[i] ), `${cfg.blacklist[i]} should NOT be in the results` );
          }
        }

        // all suggstExact bindings should be in there
        for( const exactV of exactViz ) {

          // try to find corresponding approx viz
          const approxV = viz.suggestion.find( () => true );
          assert.ok( approxV, `should include ${exactV.id}` );

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