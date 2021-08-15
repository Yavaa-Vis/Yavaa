define(function(){return [{"name":"average","desc":"Calculate the respective average.","datatype":["numeric"],"unbagOnly":false,"expanding":false,"bagging":false,"module":"avg"},{"name":"bag","desc":"Collects all values in a Bag. Keeps duplicate entries!","datatype":["all"],"defaultOption":true,"unbagOnly":false,"expanding":false,"bagging":true,"module":"bag"},{"name":"set","desc":"Collects all values in a Bag. Removes duplicate entries!","datatype":["all"],"unbagOnly":false,"expanding":false,"bagging":true,"module":"set"},{"name":"sum","desc":"Calculate the respective sum.","datatype":["numeric"],"unbagOnly":false,"expanding":false,"bagging":false,"module":"sum"},{"name":"take one","desc":"Take one entry from the given values. There is no guaranty to which entry is selected!","datatype":["all"],"unbagOnly":false,"expanding":false,"bagging":false,"module":"takeOne"},{"name":"unbag","desc":"Extract all the individual entries from a bag and separate them again.","datatype":["bag"],"subdatatype":["all"],"unbagOnly":true,"expanding":true,"bagging":false,"module":"unbag"}];});