var queryURL = "http://yeastmine-test.yeastgenome.org/yeastmine-dev/service/query/results";
var templateURL = "http://yeastmine-test.yeastgenome.org/yeastmine-dev/service/template/results";

IMBedding.setBaseUrl("http://yeastmine-test.yeastgenome.org/yeastmine-dev");
var defLayout = {
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
    	};
 
var initialized = false; // set the first time a network is drawn
var Edges = {};
var Nodes = {};
/* use hash to keep track of current network */
	
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
	  	addNetwork(data);
		var graph = convertJSON();
		reDraw(defLayout, defStyle, graph);
	  }
	);
}

function addNetwork(graph) {

	var root = graph.results.pop(); // first item in array.
	
	if(!(_.hasKey(Nodes, root.secondaryIdentifier) ))
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
	

}
function reDraw(layout, style, graph){
	/* move to somewhere more generic? */
		vis.draw({
			layout: layout,
    		visualStyle: style,
			network: graph,
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
	return {
		dataSchema:	schema,
		data: {
			nodes: $.map(Nodes, function(value, key) { return value; }),
			edges: $.map(Edges, function(value, key) { return value; })
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
