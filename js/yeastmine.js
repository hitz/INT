var queryURL = "http://yeastmine-test.yeastgenome.org/yeastmine-dev/service/query/results";
var templateURL = "http://yeastmine-test.yeastgenome.org/yeastmine-dev/service/template/results";

IMBedding.setBaseUrl("http://yeastmine-test.yeastgenome.org/yeastmine-dev");
var initialized = false; // set the first time a network is drawn
	
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
	  	var graph = convertJSON(data);
	  	var old = {};
	  	if(initialized) {
	  		old = vis.networkModel();
	  		console.log(old);
	  	}
		mergeNetworks(old, graph, {});
	  }
	);
}

function mergeNetworks(graph1, graph2, options){
		/* merge two CSW Network Models 
		 * options: 'union' or 'intersection', others
		 */
		var newGraph = {};
		if (_.isEmpty(graph1) ) {
			newGraph = graph2;
		} else {
			console.log(graph2);
			newGraph = {
				dataSchema: graph1.dataSchema, // assuming schemas are identical
				data:	 {
					nodes: _.uniq(graph1.data.nodes.concat(graph2.data.nodes)), 
					edges: _.uniq(graph1.data.edges.concat(graph2.data.edges))
				}
			}
		}
		console.log(newGraph);
		vis.draw({
			layout: {
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
    		visualStyle: defStyle,
			network: newGraph,
 	        edgeTooltipsEnabled: true,
	        nodeTooltipsEnabled: true,              
		});
		
		initialized = true;
		resetFilters();

}

function convertJSON(graph) {
	/* convert YeastMine JSON into CytoscapeWeb NetworkModel */
		
	var schema = {
			nodes: [ { name: "label", type: "string"},
					 { name: "systematicName", type: "string"},
					 { name: "geneDescription", type: "string", defValue: ""},
					],
			edges: [ { name: "label", type: "string"},
					 { name: "experimentType", type: "string"},
					 { name: "directed", type: "boolean", defValue: false},
					 { name: "weight", type: "number", devValue: 1.0},
					 { name: "interactionClass", type: "string"}
				   ]
	};
	/* does not include functional annotations */
	var root = graph.results.pop(); // first item in array.
	
	var n = {};
	n[root.secondaryIdentifier] = {
			geneDescription:	root.name,
			systematicName:		root.secondaryIdentifier,
			label:				root.symbol,
			id:					root.secondaryIdentifier
	};
	var e = {};
	
	for ( i=0;i<root.interactions.length;i++) {
		inx = root.interactions[i];
		if(!(inx.interactingGeneFeatureName in n)) {
			var trueName = ( inx.interactingGeneName == undefined ? inx.interactingGeneFeatureName : inx.interactingGeneName);
			n[inx.interactingGeneFeatureName] = {
				id:					inx.interactingGeneFeatureName,	
				label: 				trueName,
				systematicName: 	inx.interactingGeneFeatureName,
				geneDescription: 	inx.description
			};	
		}
		e["-"+inx.objectId] = {
			id:					"-"+inx.objectId,
			label:				inx.experimentType,
			experimentType:		inx.experimentType,
			interactionClass:	inx.interactionType,
			source:				root.secondaryIdentifier,
			target: 			inx.interactingGeneFeatureName,
		};
	}
	
	return {
		dataSchema:	schema,
		data: {
			nodes: $.map(n, function(value, key) { return value; }),
			edges: $.map(e, function(value, key) { return value; })
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
