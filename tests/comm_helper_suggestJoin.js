/**
 * test comm/helper.suggestJoin()
 *
 */
define( [ 'module',
          'comm/load',
          'comm/helper',
], function( module,
             commLoad,
             commHelper
){

  return function( QUnit ) {

    QUnit.module( 'comm/helper.suggestJoin(): order of datasets' );
    

    QUnit.test( `test`, async function( assert ){

      // async test
      const done = assert.async();

      // load example datasets
      const ds1Id = (await commLoad.loadData({ "id":"tag00017" })).params.data_id,
            ds2Id = (await commLoad.loadData({ "id":"tps00001" })).params.data_id;

      // test for joins either way
      const suggA = await commHelper.suggestJoin( { data_id1: ds1Id, data_id2: ds2Id }),
            suggB = await commHelper.suggestJoin( { data_id1: ds2Id, data_id2: ds1Id });

      // assertions
      assert.deepEqual( suggA.params.join_cond, 
                        suggB.params.join_cond.map( (el) => [ el[1], el[0] ] ),
                        'order of datasets should not matter' );

      done();

    });

  };

});