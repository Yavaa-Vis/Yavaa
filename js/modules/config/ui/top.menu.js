"use strict";
/**
 * configuration object for contextmenus in the data view
 */
define( [], function(){
  return {
    entries:[
      { 'label': 'Undo',                        'dialog': 'undo',             'classes': 'undo icon icon-undo',         'disabled': true },
      { 'label': 'Redo',                        'dialog': 'redo',             'classes': 'redo icon icon-redo',         'disabled': true },
      { 'label': 'Load Dataset',                'dialog': 'loadDataset',      'classes': 'icon icon-loadDataset' },
      { 'label': 'Execute Workflow',            'dialog': 'execWorkflow',     'classes': 'icon icon-execWorkflow' },
      { 'label': 'Construct a dataset',         'dialog': 'constructDataset', 'classes': 'icon icon-constructDataset' },
      { 'label': 'Compose a command manually',  'dialog': 'composeCommand',   'classes': 'icon icon-composeCommand',    'hideInProd': true },
    ]
  };
});