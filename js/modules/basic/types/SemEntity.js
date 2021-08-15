"use strict";
define( [ 'store/metadata' ], function( MetaStore ){

  /**
   * holding a reference to a semantic entity
   *
   * properties:
   * _val         ... current label
   * _codelist    ... respective codelist, this value belongs to; actual label-entity pairs
   * _uri         ... the URI corresponding to this entry
   */
  function SemEntity() {
    throw new Error( 'Abstract constructor called: SemEntity' );
  }

  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Getter XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  // get URI
  SemEntity.prototype.getURI = function getURI() {
    return this._uri;
  }

  // get label
  SemEntity.prototype.getLabel = function getLabel() {
    return this._label;
  }

  // get codelist
  SemEntity.prototype.getCodelist = function getCodelist() {
    return this._codelist;
  }

  // Serializing
  SemEntity.prototype.toString = function(){
    return this._label || this._val || this._uri;
  };
  SemEntity.prototype.toJSON = SemEntity.prototype.toString;

  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Setter XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  // set URI
  SemEntity.prototype.setURI = function setURI( uri ) {
    this._uri = uri;
  }

  // set label
  SemEntity.prototype.setLabel = function setLabel( label ) {
    this._label = label;
  }

  /**
   * resolve URIs for all instances belonging to this type
   */
  SemEntity.resolveURIs = async function resolveURIs(){

    // get the constraints
    const clURI     = this._codeListURI,
          clLabels  = Object.keys( this._codeList );

    // get value to URI mapping
    const val2uri = await MetaStore.resolveCodelistValueURIs( clURI, clLabels );

    // set URIs for all values and collect URIs
    Object
      .keys( val2uri )
      .forEach( (value) => {

        if( this._codeList[ value ] ) {

          // set URI
          this._codeList[ value ].setURI( val2uri[ value ] );

        }

      });

  };


  /**
   * resolve label and URI for all instances belonging to this type
   *
   * resolveURIs() should have been called right after loading, so URIs should be available
   */
  SemEntity.resolveEntities = async function resolveEntities(){

    // get the URIs for all instances in this type
    const uris = new Set(
        Object.values( this._codeList )
              .map( (el) => el.getURI() )
              .filter( (uri) => !!uri )
    );

    // retrieve labels
    const uri2label = await MetaStore.resolveName( [ ... uris ] );

    // set labels for all values
    Object
      .keys( this._codeList )
      .forEach( (val) => {

        // shortcuts
        const entry = this._codeList[ val ],
              uri   = entry.getURI();

        // add label
        if( uri in uri2label ) {
          entry.setLabel( uri2label[ uri ] );
        }

      });

  };


  /*
   * compare two entries
   */
  SemEntity.prototype.compare = function( other ) {
    if( !other || other._type != this._type ) {
      return 1;
    } else if( this._val == other._val ) {
      return 0;
    } else {
      return this.toString().localeCompare( other.toString() );
    }
  };


  /**
   * hash
   *
   * @TODO this should also respect the codelist, if we have no URI yet
   */
  SemEntity.prototype.hash = function(){

    if( this._url  ) {

      // if we got a url, use it
      return this._uri;

    } else {

      // else return the current label
      return this._val;

    }

  }

  SemEntity.prototype['_type'] = 'SemEntity';

  return SemEntity;
});