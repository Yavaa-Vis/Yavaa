"use strict";
/**
 * configuration object for contextmenus for datasets
 */
define( [], function(){
  return {
    'entries':[
      { 'id': 'viewData',         'label': 'View: Data',          'view': 'data',                'classes': 'icon icon-none',            'contextmenuonly': true },
      { 'id': 'viewViz',          'label': 'View: Visualization', 'view': 'viz',                 'classes': 'icon icon-none',            'contextmenuonly': true },
      { 'id': 'viewWf',           'label': 'View: Workflow',      'view': 'wf',                  'classes': 'icon icon-none',            'contextmenuonly': true },
      {                           'label': '---',                                                                                       'contextmenuonly': true },
      { 'id': 'changeView',       'label': 'Change View',        'dialog': 'changeView',        'classes': 'icon icon-changeView' },
      { 'id': 'resolveColValues', 'label': 'Resolve Labels',     'dialog': 'resolveColValues',  'classes': 'icon icon-resolve' },
      { 'id': 'getWorkflow',      'label': 'Get Workflow',       'dialog': 'getWorkflow',       'classes': 'icon icon-execWorkflow',    'hideInProd': true },
      { 'id': 'visualize',        'label': 'Visualize Dataset',  'dialog': 'visualize',         'classes': 'icon icon-visualize' },
      { 'id': 'aggregate',        'label': 'Aggregate',          'dialog': 'aggregate',         'classes': 'icon icon-aggregate' },
      { 'id': 'showMeta',         'label': 'Show metadata',      'dialog': 'showMeta',          'classes': 'icon icon-info' },
      { 'id': 'export',           'label': 'Export',             'dialog': 'export',            'classes': 'icon icon-export' },
      { 'id': 'joinDatasets',     'label': 'Join two datasets',  'dialog': 'joinDatasets',      'classes': 'icon icon-joinDatasets' },
      { 'id': 'applyFunction',    'label': 'Apply Function',     'dialog': 'applyFunction',     'classes': 'icon icon-applyFunction' },
    ]
  };
});