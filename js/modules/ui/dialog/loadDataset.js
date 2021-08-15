"use strict";
/**
 * dialog to load a new dataset
 */
define( ['config/server',
         'ui/basic/Yavaa.global',
         'text!template/ui/dialog/loadDataset.htm',
         'ui/dialog/Wrapper',
         'ui/dialog/loadDataset/upload',
         'ui/dialog/loadDataset/name',
         'ui/dialog/loadDataset/search'
         ],
function(ServerCfg,
         Y,
         templ,
         DialogWrapper,
         UploadTab,
         NameTab,
         SearchTab
         ){

  // dialog content
  const $content = $( templ );

  // init tabs
  $content.tabs({
    'activate': (ev,ui) => observeChange( ui.newPanel.data( 'handler' ) ),
    'disabled': ServerCfg.isProduction ? [ 1 ] : [] ,     // disable the upload dataset tab for now
  });
  const nameTab   = new NameTab(   $content.find( '#loadDataset_frag2' ) ),
        uploadTab = new UploadTab( $content.find( '#loadDataset_frag1' ) ),
        searchTab = new SearchTab( $content.find( '#loadDataset_frag0' ) );

  /* XXXXXXXXXXXXXXXXXXXXXX Load Button XXXXXXXXXXXXXXXXXXXXXX */

  nameTab.on( 'change', observeChange );
  uploadTab.on( 'change', observeChange );
  searchTab.on( 'change', observeChange );

  /**
   * listener for changes in the tabs
   */
  function observeChange( target ) {

    // activate/deactivate load button
    if( target.isValid() ) {
      dialog.setDisabled( 'Load', false );
    } else {
      dialog.setDisabled( 'Load', true );
    }

  }

  /* XXXXXXXXXXXXXXXXXXXXXXXX General: Dialog Setup XXXXXXXXXXXXXXXXXXXXXXXX */

  // create dialog
  const dialog = new DialogWrapper( $content,{

    'buttons': [

      {
        text: 'Load',
        click: async function(){

          // set processing
          dialog.setProcessing( 'Load' );

          // get active tab
          const activeTab = $content.tabs( 'option', 'active' );

          // proceed depending on tab
          switch( activeTab ) {

            // search
            case 0: {
                      // get id from field
                      const id = searchTab.getInput();

                      // trigger loading of dataset
                      await Y.CmdBroker.loadDataset( id );

                      break;
                    }

            // upload file
            case 1: {
                     // get input values
                     const inp = uploadTab.getInput();

                     // load dataset
                     await Y.CmdBroker.loadFile( inp.module,
                                                 inp.file,
                                                 inp.settings,
                                                 inp.parser
                                               );

                     break;
                    }

            // load dataset by id
            case 2: {
                      // get id from field
                      const id = nameTab.getInput();

                      // trigger loading of dataset
                      const success = await Y.CmdBroker.loadDataset( id );

                      // show error, if we could not load the dataset
                      if( !success ) {

                        // error message
                        dialog.showError( 'invalidid' );

                        // disable processing
                        dialog.setProcessing();

                        return;

                      }

                      break;
                    }

            default: throw new Error( 'Missing tab handler!' );

          }

          // disable processing
          dialog.setProcessing();

          // close dialog
          dialog.close();

        }
      },{
        text:     'Cancel',
        'class':  'secondary',
        click:    () => dialog.close()
      },

    ],

    'close': function(){

    },

    'beforeOpen': function(){

      // reset tabs
      searchTab.reset();
      uploadTab.reset();
      nameTab.reset();

      // focus tab1
      $content.tabs( 'option', 'active', 0 )

      // disable load button
      dialog.setDisabled( 'Load' );

    }
  });


  // return wrapped version
  return dialog;
});