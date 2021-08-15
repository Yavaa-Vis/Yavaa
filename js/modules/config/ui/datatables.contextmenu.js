"use strict";
/**
 * configuration object for contextmenus in the data view
 */
define( [ 'basic/Constants' ], function( Constants ){
  return {
    'entries':[
      { 'id': 'applyFunction',    'label': 'Apply Function',        'dialog': 'applyFunction',    'classes': 'icon icon-applyFunction' },
      { 'id': 'dropColumn',       'label': 'Drop Column',           'dialog': 'dropColumn',       'classes': 'icon icon-dropColumn' },
      { 'id': 'filter',           'label': 'Filter by this column', 'dialog': 'filter',           'classes': 'icon icon-filter' },
      { 'id': 'resolveColValues', 'label': 'Resolve Labels',        'dialog': 'resolveColValues', 'classes': 'icon icon-resolve' },
      { 'id': 'setUnit',          'label': 'Unit: -',               'dialog': 'setUnit',          'classes': 'icon icon-unit',
        'update': async (col) => { const u = col.getUnit(); return u && 'Unit: "' + u.getLabel() + '"' }
      },
      { 'id': 'unbag',            'label': 'Unbag this column',     'dialog': 'unbag',            'classes': 'icon icon-unbag' },
    ],
    'menus':{
      [ Constants.DATATYPE.NUMERIC ]:  [ 'setUnit',  'applyFunction', 'filter', 'dropColumn', ],
      [ Constants.DATATYPE.TIME ]:     [ 'filter', 'dropColumn', ],
      [ Constants.DATATYPE.SEMANTIC ]: [ 'filter', 'dropColumn', 'resolveColValues' ],
      [ Constants.DATATYPE.STRING ]:   [ 'dropColumn', ],
      [ Constants.DATATYPE.BAG ]:      [ 'dropColumn', 'unbag', ]
    }
  };
});