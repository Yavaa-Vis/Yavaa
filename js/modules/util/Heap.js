"use strict";
/**
 * Defines a Binary Heap structure
 * taken from Datastructures.js
 * 
 *
 * Heap element structure
 * {
 *   key: Number
 *   payload: Object
 * }
 *
 */
define( function(){

  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Constructor XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  //@const
  var HEAP_LINK = '_heapElement';
  
  /**
  * @constructor
  * @param {Boolean}   isMax   is this a maximum-heap or a minimum heap
  */
  function Heap( isMax ) {
  
   // save type
   Object.defineProperty( this, '_isMax', { 'value': !!isMax } );
  
   // init heap structure
   Object.defineProperty( this, '_heap', { 'value': [] } );
  
   // set respective comparator function
   if( this._isMax ) {
     this._compare = Heap.maxCompare.bind( this );
   } else {
     this._compare = Heap.minCompare.bind( this );
   }
  
  }
  
  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXX Public Methods XXXXXXXXXXXXXXXXXXXXXXXXXXXX */
  
  
  /**
  * creates a new Heap out of
  */
  Heap['build'] = function( arr, key, isMax ){
   var i;
   // init result heap
   var result = new Heap( isMax );
  
   // transform import array to heapable array
   var heap = [],
       newElement;
   for( i=arr.length; i--; ) {
     if( key in arr[i] ) {
  
       // create heap element
       newElement = new Heap.Entry( +arr[i][key], arr[i] )
  
       // save link to heap element
       arr[i].setAttribute( HEAP_LINK, newElement );
  
       // add to heap
       heap.push( newElement );
     }
   }
  
   // add heapable array to result heap and heapify it
   result._heap = heap;
   for( i=Math.floor(heap.length/2); i--; ) {
     result._heapify( i );
   }
  
  
   // return result
   return result;
  
  };
  
  
  
  /**
  * extract the head of the heap
  * @return {*}    the payload of the current extremum
  */
  Heap.prototype['extract'] = function(){
  
   // do we have an element left?
   if( this._heap.length < 1 ) {
     return null;
   }
  
   // prepare result
   var extr;
  
   if( this._heap.length == 1 ) {
  
     // just one element left
  
     extr = this._heap.pop();
  
   } else {
  
     // more than one element left
  
     // get the extr element
     extr = this._heap[0];
  
     // swap the last element to the top
     this._heap[ 0 ] = this._heap.pop();
  
     // maintain the heap property
     this._heapify( 0 );
  
   }
  
   // remove link to heap element
   extr.setAttribute( HEAP_LINK );
  
   // return the payload
   return extr.payload;
  };
  
  
  /**
  * return the head of the heap without extracting it
  * @return {*}    the payload of the current extremum
  */
  Heap.prototype['peek'] = function(){
  
   // do we have an element left?
   if( this._heap.length < 1 ) {
     return null;
   }
  
   // get head
   var extr = this._heap[0];
  
   // return the payload
   return extr.payload;
  };
  
  
  /**
  * Insert a new element to the heap
  * @param {Number}  key       key value for the new element
  * @param {Number}  payload   the payload of the new element
  * @return {Heap.Entry}
  */
  Heap.prototype['insert'] = function( key, payload ) {
  
   // create new element
   var newElement = new Heap.Entry( +key, payload );
  
   // store link
   newElement.setAttribute( HEAP_LINK, newElement );
  
   // insert at the end of the heap
   var index = this._heap.length;
   this._heap.push( newElement );
  
   // trickle upwards
   var parent = getParent( index );
   while( (index > 0) && (this._compare( index, parent ) < 0) ) {
  
     // swap parent and respective child
     this._swap( parent, index );
  
     // move upwards
     index = parent;
     parent = getParent( index );
  
   }
  
   // return
   return newElement;
  };
  
  
  /**
  * remove an element from the Heap
  * @param {Heap.Entry}    el    the element to remove
  * return {*}                   the payload of the removed entry
  */
  Heap.prototype['remove'] = function( el ) {
  
   // get respective heap element
   var heapEl = el.getAttribute( HEAP_LINK );
  
   // get the index of the element
   var index = this._findElement( heapEl );
  
   // if not found, return
   if( index < 0 ) {
     return;
   }
  
   // replace by last item
   this._heap[ index ] = this._heap[ this._heap.length - 1 ];
  
   // remove last item
   this._heap.pop();
  
   // if the swap did not happen at the tail, we have to restore heap property
   if( index < this._heap.length ) {
  
     if( ((index==0)) || ((this._heap[index].key < this._heap[ getParent(index) ])) ) {
       this._heapify( index );
     } else {
       this._changeKey( index, this._heap[index].key );
     }
  
   }
  
   // remove link to heap element
   el.setAttribute( HEAP_LINK );
  
   // return the payload of the removed element
   return el;
  };
  
  
  
  /**
  * change the key of an element inside the Heap
  * just decrease in MinHeaps or increase in MaxHeaps
  * @param   {Heap.Entry}    el        the targeted element
  * @param   {Number}        newKey    the new key value
  * @returns {Boolean}                 Boolean indicating, whether the operation was successful
  */
  Heap.prototype['changeKey'] = function( el, newKey ){
  
   // get corresponding heap element
   var heapEl = el.getAttribute( HEAP_LINK );
  
   // get the index
   var index = this._findElement( heapEl );
  
   // if not found, return
   if( index < 0 ) {
     return false;
   }
  
   // check, if key is correctly increased or decreased
   if( this._isMax === (heapEl.key > newKey) ) {
     return false;
   }
  
   // perform the real change key
   this._changeKey( index, newKey );
  
   // success
   return true;
  };
  
  
  
  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXX Private Methods XXXXXXXXXXXXXXXXXXXXXXXXXXX */
  
  
  /**
  * perform the changeKey operation by beeing given the index of the element inside the Heap
  * @param {Number}  index     the index of the respective element inside the Heap
  * @param {Number}  newKey    the new key for that element
  */
  Heap.prototype._changeKey = function( index, newKey ) {
  
   // adjust key
   this._heap[ index ].key = +newKey;
  
   // move the changed element upwards as needed
   var parent = getParent( index );
   while( (index > 0) && (this._compare( index, parent ) < 0 ) ) {
  
     // swap
     this._swap( index, getParent( index ) );
  
     // next iteration
     index = parent;
     parent = getParent( index );
  
   }
  
  };
  
  
  /**
  * Swap two elements in the Heap
  * @param {Number}    index1    Index of one element
  * @param {Number}    index2    Index of the other element
  */
  Heap.prototype._swap = function( index1, index2 ) {
   var tmp = this._heap[ index1 ];
   this._heap[ index1 ] = this._heap[ index2 ];
   this._heap[ index2 ] = tmp;
  };
  
  
  /**
  * find a specific element in the heap and return it's index
  * @param   {Heap.Entry}  el    the element to search the position of
  * @return  {Number}            the index of the element or -1, if not found
  */
  Heap.prototype._findElement = function( el ) {
  
   // traverse heap until element is found ...
   for( var i=this._heap.length; i--; ) {
     if( this._heap[i] == el ) {
       return i;
     }
   }
  
   // ... or return -1, if not found
   return -1;
  };
  
  
  /**
  * make sure the heap condition is satisfied in the subtree starting at index
  * @param {Number}  index   the root-index of the examined subtree
  */
  Heap.prototype._heapify = function( index ) {
  
   // length of the heap array
   var size = this._heap.length;
  
   // get root of current subtree
   var root = index;
  
   var child,    // pointer to respective child
       extr;     // current extremum within examined subtree
  
   do {
  
     // assume root is extremum
     extr = root;
  
     // check left child
     child = getLeftChild( root );
     if( (child < size) && (this._compare( child, extr ) < 0) ) {
       extr = child;
     }
  
     // check right child
     child = getRightChild( root );
     if( (child < size) && (this._compare( child, extr ) < 0) ) {
       extr = child;
     }
  
     // if root is already extremum, we are done
     if( extr == root ) {
       return;
     }
  
     // else we need to swap
     this._swap( root, extr );
  
     // next element
     root = extr;
  
   } while( true );
  
  };
  
  
  /*
  * Comperator functions for max and min heaps
  */
  Heap.maxCompare = function( a, b ) {
   return this._heap[ b ].key - this._heap[ a ].key;
  };
  Heap.minCompare = function( a, b ) {
   return this._heap[ a ].key - this._heap[ b ].key;
  };
  
  
  /*
  * determine left and right child index
  */
  function getLeftChild( index ) { return 2*index + 1; }
  function getRightChild( index ) { return 2*index + 2; }
  
  /*
  * determine parent index
  * ( compensate for array starting with zero and not one )
  */
  function getParent( index ) { return Math.floor( (index - 1) / 2 ); }
  
  
  var base = 32416189987,     // is prime
  modulus = 100000000000, // is relative prime to base
  lastId = base;          // the last returned id
  /**
  * generate a sequence of pseudorandom ids
  * @returns {number}  id
  */
  function getUniqueId() {
   lastId = (lastId + base) % modulus;
   return lastId;
  }
  
  
  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Entry Class XXXXXXXXXXXXXXXXXXXXXXXXXXXXX */
  
  /**
  * @constructor
  * @param   {*}   payload     payload of this entry
  */
  Heap.Entry = function( key, payload ) {
  
   // save key
   Object.defineProperty( this, 'key', { 'value': key, 'writable': true } );
  
   // save payload
   Object.defineProperty( this, 'payload', { 'value': payload } );
  
   // init BaseItem properties
   this.init();
  };
  
  
  //set prototype for items
  Heap.Entry.prototype = new BaseItem();
  
  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */
  /* XXXXXXXXXXXXXXXXXXXXXXX BaseItem XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */
  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */
  
  /**
   * @constructor
   */
  function BaseItem() {}
  
  
  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXX Methods XXXXXXXXXXXXXXXXXXXXXXXXXXXX */
  
  
  /**
   * initialize the object
   */
  BaseItem.prototype.init = function init() {
  
    // init attributes
    Object.defineProperty( this, '_attributes', { 'value': {} } );
  
    // set ID
    Object.defineProperty( this, '_id', { 'value': getUniqueId() } );
  
  };
  
  
  /**
   * get an attribute value
   * @param   {String}    key
   * @returns {*}
   */
  BaseItem.prototype.getAttribute = function getAttribute( key ) {
    return this._attributes[key];
  };
  
  
  /**
   * set an attribute's value
   * @param {String}    key
   * @param {*}         value
   */
  BaseItem.prototype.setAttribute = function setAttribute( key, value ) {
    this._attributes[ key ] = value;
  };
  
  
  /**
   * set multiple attributes
   * @param {Object}    atts
   */
  BaseItem.prototype.setAttributes = function setAttributes( atts ) {
    var keys = Object.keys( atts );
    for( var i=0; i<keys.length; i++ ) {
      this._attributes[ keys[i] ] = atts[ keys[i] ];
    }
  };
  
  
  /**
   * get the id
   * @returns {Number}
   */
  BaseItem.prototype.getId = function getId(){
    return this._id;
  };

  
  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */
  /* XXXXXXXXXXXXXXXXXXXXXXXX EXPORT XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */
  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */
  
  return Heap;
});