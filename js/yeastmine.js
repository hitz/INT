var queryURL = "http://yeastmine-test.yeastgenome.org/yeastmine-dev/service/query/results";
var templateURL = "http://yeastmine-test.yeastgenome.org/yeastmine-dev/service/template/results";

IMBedding.setBaseUrl("http://yeastmine-test.yeastgenome.org/yeastmine-dev");
	
function getInts(gene) {
		/* given some arguments (gene names, network type, edge type) fetch interactions from YeastMine via webservices */
	$.get(
		templateURL,
 	  	{ 
    	name:        "Gene_Interaction_Single",
   	 	constraint1: "Gene",
    	op1:         "LOOKUP",
    	value1:      gene,
    	format:      "jsonpobjects"
	  },
  // This function will log the returned json resultset to console, providing
  // you have Chrome/Firebug/Opera. Firefox without Firebug will throw an error
 	 function(data) {console.log(data.results)},
  	"jsonp"
);
}
	
function convertJSON(graph) {
		/* convert YeastMine JSON into CytoscapeWeb NetworkModel */
		
}
	
function mergeNetworks(graph1, graph2, options){
		/* merge two CSW Network Models 
		 * options: 'union' or 'intersection', others
		 */
}
	
function getGO(genes) {
		/* Get GO data for an array of genes */
}

function getGeneList() {
	var genes = IMBedding.loadTemplate(
		{	name:			"All_Orf_name",
			constraint1:	"Gene.featureType",
			op1:			"eq",
			value1: 		"ORF",
			format:			"jsonpobjects"
		},
		function( data ) {
			var geneList = $.map(data.results, function( r, item ) {
				return [ 
					{
						label: r.symbol,
						value: r.symbol
					},
					{
						label: r.secondaryIdentifier,
						value: r.secondaryIdentifier
					}
					];
			});
			console.log(geneList);
 			$("#search").autocomplete({
		    	source: geneList,
   			 	minLength: 2,
		    	select: function(event,ui) {
		    		getInts(ui.item.value)
    			}
    		})
   		}
);
}
/*
 
 	$.jsonp(
		url: templateURL,
		data: {
			name:		 "All_Orf_name",
			constraint1: "Gene.featureType",
			op1:		 "eq",
			value1:		 "ORF",
			format:		 "jsonpobjects"
		},
		success: function(data) {
			var geneList = $.map(data.results, function( item ) {
				return 
					[
					 {
						label: item.secondaryIdentifier,
					  	value: item.secondaryIdentifier
					 },
					 {
						label: item.symbol,
					  	value: item.symbol
					 }
					];
			});
			console.log(geneList);
 			$("#search").autocomplete({
		    	source: geneList,
   			 	minLength: 2,
		    	select: function(event,ui) {
		    		getInts(ui.item.value)
    			}
    		})
   		},
    	error: function(d, msg)
	);
	*/