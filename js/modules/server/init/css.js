"use strict";
/**
 * build the LESS files into a single compressed CSS file
 *
 * *** JUST RUN ON SERVER ***
 *
 */
module.exports = async function(){

  // includes
  const Fs    = require( 'fs' ),
        Path  = require( 'path' ),
        Less  = require( 'less' ),
        LessPluginCleanCSS = require('less-plugin-clean-css'),
        ServerCfg = require( Path.join( __dirname, '..', '..', 'config', 'server' ) );

  // config
  const cfg = {
      cssBase:      Path.join( __dirname, '..', '..', '..', '..', 'webRoot', 'css' ),
      targetName:   'styles.css',
      sourceName:   'styles.less',
      templateBase: Path.join( __dirname, '..', '..', '..', '..', 'template', 'webRoot' ),
      webRootBase:  Path.join( __dirname, '..', '..', '..', '..', 'webRoot' ),
      indexName:    'index.htm',
      placeholder:  '<!-- css -->',
      cssContent:   `<link rel="stylesheet" type="text/css" href="./css/styles.css" />`,
      lessContent:  `<script>
                     window.less = {
                       logLevel: 1
                     };
                     </script>
                     <link rel="stylesheet/less" type="text/css" href="./css/styles.less" />
                     <script src="./lib/less/less.min.js"></script>`,
  };

  // load main source file
  const source = Fs.readFileSync( Path.join( cfg.cssBase, cfg.sourceName ), 'utf8' );

  // init plugins
  const plugins = [];
  plugins.push(  new LessPluginCleanCSS({advanced: true}) );

  // compile
  const target = await Less.render( source, {
                    paths: [ cfg.cssBase ],
                    logLevel: 2,
                    plugins: plugins,
                 });

  // write to target file
  const targetPath = Path.join( cfg.cssBase, cfg.targetName );
  Fs.writeFileSync( targetPath, target.css );

  // process index.htm
  let index = Fs.readFileSync( Path.join( cfg.templateBase, cfg.indexName ), 'utf8' );
  const cssContent = ServerCfg.isProduction ? cfg.cssContent : cfg.lessContent;
  index = index.replace( cfg.placeholder, cssContent );
  Fs.writeFileSync( Path.join( cfg.webRootBase, cfg.indexName ), index );

  // log
  console.log( JSON.stringify( new Date()), 'Compiled styles.css' );
  console.log( JSON.stringify( new Date()), '   Written to ' + targetPath );
  console.log( JSON.stringify( new Date()), '   Written to ' + Path.join( cfg.webRootBase, cfg.indexName ) );

}