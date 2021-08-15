 "use strict";
/**
 * return a list of possible concepts and their respective labels for a given substring
 * types are given by constants
 * TYPE_DIMENSION
 * TYPE_MEASUREMENT
 * TYPE_COLUMN
 * TYPE_VALUE
 */
define([ 'basic/Constants', 'util/flatten.sparql'], function( Constants, flatten ){

  // Lucene stopwords
  // https://stackoverflow.com/a/17531638/1169798
  const LUCENE_STOPWORDS = [  "a", "an", "and", "are", "as", "at", "be", "but", "by",
                              "for", "if", "in", "into", "is", "it",
                              "no", "not", "of", "on", "or", "such",
                              "that", "the", "their", "then", "there", "these",
                              "they", "this", "to", "was", "will", "with" ];

  function createFunction( doQuery ) {

    /**
     * return concepts and labels
     * @param {String}  needle    given substring
     * @param {Number}  amount    amount of entries to return
     * @param {String}  type      restriction results to a specific type
     * @param {String*} codelist  (optional) codelist, if searching for values
     */
    async function typeAhead( needle, amount, type, codelist ) {

      // check type of needle and convert to lowercase
      needle = ('' + needle).toLowerCase().trim();
      
      // get individual tokens in query
      const tokens = needle.replace( /[^a-z0-9]/gi, ' ' )   // remove any non alphanumeric character
                           .replace( /\s+/g, ' ' )          // make sure there is always just one consecutive space
                           .split( ' ' );                   // split into tokens

      // convert needle to Lucene query syntax, as we currently use that one
      // https://lucene.apache.org/core/7_5_0/queryparser/org/apache/lucene/queryparser/classic/package-summary.html#package.description
      let needleLucene;
      if( tokens.length > 1 ) {

        // need a copy of tokens to create Lucene query
        const luceneTokens = tokens.slice( 0 );

        // last token might be incomplete
        const lastToken = luceneTokens[ tokens.length - 1 ];

        // Lucene somehow can not handle wildcards with stopwords
        if( LUCENE_STOPWORDS.includes( lastToken.toLowerCase() ) ) {
          // we just leave it as is
        } else {
          // add a wildcard operator
          luceneTokens[ luceneTokens.length - 1 ] = `( ${lastToken} ${lastToken}* )`;
        }

        // combine into query string
        needleLucene = luceneTokens.join( ' AND ' );

      } else {
        needleLucene = needle + '*';
      }

      // get respective template and set values
      let templ, val;
      switch( type ){

        case typeAhead.TYPE_DIMENSION:  templ = 'search/typeAhead/column';
                                        val = {
                                          'needle': needle,
                                          'needleLucene': needleLucene,
                                          'type': 'Dimension',
                                          'amount': amount
                                        };
                                        break;
        case typeAhead.TYPE_MEASUREMENT:  templ = 'search/typeAhead/column';
                                          val = {
                                            'needle': needle,
                                            'needleLucene': needleLucene,
                                            'type': 'Measure',
                                            'amount': amount
                                          };
                                          break;

        case typeAhead.TYPE_COLUMN:   templ = 'search/typeAhead/column_all';
                                      val = {
                                        'needle': needle,
                                        'needleLucene': needleLucene,
                                        'amount': amount
                                      };
                                      break;

        case typeAhead.TYPE_VALUE:  // if a codelist is given, restrict to that, else use all
                                    if( codelist ) {
                                      templ = 'search/typeAhead/value';
                                    } else {
                                      templ = 'search/typeAhead/value_all';
                                    }

                                    val = {
                                      'needle': needle,
                                      'needleLucene': needleLucene,
                                      'type': { value: codelist, type: 'uri' },
                                      'amount': amount
                                    };
                                    break;

        case typeAhead.TYPE_DATASET:  templ = 'search/typeAhead/dataset';
                                      val = {
                                        'needle': needle,
                                        'needleLucene': needleLucene,
                                        'amount': amount
                                      };
                                      break;

        default:  throw new Error( 'Missing/Unknown type!' );
      }

      // add harmonized type values
      val['typeNumeric']  = Constants.DATATYPE.NUMERIC;
      val['typeTime']     = Constants.DATATYPE.TIME;
      val['typeSemantic'] = Constants.DATATYPE.SEMANTIC;

      // query database
      const rdata = await doQuery( templ, val );

      // flatten results
      const data = flatten(rdata);

      // check for tokens
      const needleRegexps = tokens
        .filter( (t) => !LUCENE_STOPWORDS.includes(t) )     // dont look for stopwords
        .map( (t) => new RegExp( t, 'i' ) );           // to regexp

      // convert results
      const parsed = {};
      for( const entry of data ) {

        // make sure the needle is included completely
        // Lucene might look for the tokens in different places in the string
        const tokenMissing = needleRegexps.some( (r) => {
          r.lastIndex = 0;
          return !r.test( entry['label'] );
        });
        if( tokenMissing ) {
          continue;
        }

        // init property
        parsed[ entry['concept'] ] = {
          'label':          entry['label'],
          'type':           ('type' in entry)           ? entry['type']          : undefined,  // values do not have a type
          'codelist':       ('codelist' in entry)       ? entry['codelist']      : undefined,  // sometime we get the associated codelist
          'codelistLabel':  ('codelistLabel' in entry)  ? entry['codelistLabel'] : undefined,  // ... and an associated label
        };

      }

      // pass on result
      return parsed;

    }

    // constants for types
    typeAhead.TYPE_DIMENSION = 1;
    typeAhead.TYPE_MEASUREMENT = 2;
    typeAhead.TYPE_COLUMN = 3;
    typeAhead.TYPE_VALUE = 4;

    // return function
    return typeAhead;

  }

  return createFunction;

});