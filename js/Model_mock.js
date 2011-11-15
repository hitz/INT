/**
 * Fake data object that returns canned JSON requests for testing
 * @author Benjamin Hitz
 */

var Model = function() {
	
	var type = 'mock';
	var tmpUrlRoot = '/INT/tmp/json';
	
	
	return {
		getGO: function(geneList,callback){
			$.get(tmpUrlRoot+'getGO_mfalpha.json',function(data) {callback(data)});
		},
		getInts: function(rootNode,filter,callback){},
		fillNetwork: function(geneListA,geneListB,filter,callback){},
		getGeneList: function(callback){},
		getGOSlim: function(geneList,callback){},
		
	};
}
