var queryURL = "http://yeastmine-test.yeastgenome.org/yeastmine-dev/service/query/results";
var templateURL = "http://yeastmine-test.yeastgenome.org/yeastmine-dev/service/template/results";

IMBedding.setBaseUrl("http://yeastmine-test.yeastgenome.org/yeastmine-dev");
	
function getInts(gene) {
		/* given some arguments (gene names, network type, edge type) fetch interactions from YeastMine via webservices */
	IMBedding.loadTemplate(
		{  	 
	 	   	name:        "Gene_Interaction_Single",
	   	 	constraint1: "Gene",
	    	op1:         "LOOKUP",
	    	value1:      gene,
	    	format:      "jsonpobjects"
	  },
	  function ( data ) {
	  	console.log(data);
	  	var graph = convertJSON(data);
		mergeNetworks(null, graph, {});
	  }
	);
}

function mergeNetworks(graph1, graph2, options){
		/* merge two CSW Network Models 
		 * options: 'union' or 'intersection', others
		 */
					     vis.draw({layout: {
			     		       name: "ForceDirected",
                                               options: {
					 	        mass: 300,
					      		gravitation: -500,
					    		tension: 0.1,
					       		restLength: "auto",
					       		drag: 0.4,
					       		iterations: 400 ,
					       		maxTime: 20000 ,
					       		minDistance: 1,
					       		maxDistance: 10000,
					       		autoStabilize: true
						       }

    						},
				       network: graph2,
 	                               edgeTooltipsEnabled: true,
	                               nodeTooltipsEnabled: true,              
				       });
		             resetFilters();

}

function convertJSON(graph) {
	/* convert YeastMine JSON into CytoscapeWeb NetworkModel */
		
	var schema = {
			nodes: [ { name: "label", type: "string"},
					 { name: "systematicName", type: "string"},
					 { name: "geneDescription", type: "string"},
					],
			edges: [ { name: "label", type: "string"},
					 { name: "experimentType", type: "string"},
					 { name: "directed", type: "boolean", defValue: false},
					 { name: "weight", type: "number", devValue: 1.0},
					 { name: "interactionClass", type: "string"}
				   ]
	};
	/* does not include functional annotations */
	var root = {
				id:					graph.secondaryIndentifier,			 
				label: 				graph.symbol,
				systematicName: 	graph.secondaryIdentifier,
				geneDescription: 	graph.name
			};
	n = [root];
	e = [];
	for ( inx in graph.results) {
		n.push({
			id:					inx.interactingFeatureName,	
			label: 				inx.interactingGeneName,
			systematicName: 	inx.interactingFeatureName,
			geneDescription: 	inx.description
		});
		e.push({
			id:					inx.objectId,
			label:				inx.experimentType,
			experimentType:		inx.experimentType,
			interactionClass:	inx.interactionType,
		});	
	}
	return {
		dataSchema:	schema,
		data: {
			nodes: n,
			edges: e
		}
	};
}	
	
function getGO(genes) {
		/* Get GO data for an array of genes */
}

function getGeneList() {
	IMBedding.loadTemplate(
		{	
			name:			"All_Orf_name",
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
