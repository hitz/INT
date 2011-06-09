IMBedding.setBaseUrl("http://yeastmine.yeastgenome.org/yeastmine");
 
var initialized = false; // set the first time a network is drawn
var Edges = {};
var Nodes = {};
var CSWnetwork = {};
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
	  	/*getGO($.map(Nodes,function(val, key) { 
	  		return (val.GO_SLIM_FUNCTION == undefined ? "" : val.systematicName )
	  		})); // map here is unnecessary but keeps getGO function more generic for later*/
		CSWnetwork = convertJSON();
		reDraw(defLayout, defStyle, CSWnetwork);
	  }
	);
}

function addNetwork(graph) {

	/* This adds all "new" nodes and new edges by ID into a graph */

	var root = graph.results.pop(); // first item in array.
	
	if(Nodes[root.secondaryIdentifier] == undefined) {
		Nodes[root.secondaryIdentifier] = {
			geneDescription:	root.name,
			systematicName:		root.secondaryIdentifier,
			label:				root.symbol,
			id:					root.secondaryIdentifier
		};
	}
	var e = {};
	
	for ( i=0;i<root.interactions.length;i++) {
		inx = root.interactions[i];
		if (Nodes[inx.interactingGeneFeatureName] == undefined ) {
			var trueName = ( inx.interactingGeneName == undefined ? inx.interactingGeneFeatureName : inx.interactingGeneName);
			Nodes[inx.interactingGeneFeatureName] = {
					id:					inx.interactingGeneFeatureName,	
					label: 				trueName,
					systematicName: 	inx.interactingGeneFeatureName,
					geneDescription: 	inx.description
			};	
		}
		if (Edges["-"+inx.objectId] == undefined) {
			Edges["-"+inx.objectId] = {
				id:					"-"+inx.objectId,
				label:				inx.experimentType,
				experimentType:		inx.experimentType,
				interactionClass:	inx.interactionType,
				source:				root.secondaryIdentifier,
				target: 			inx.interactingGeneFeatureName,
			};
		}
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

function convertJSON() {
	/* convert YeastMine JSON into CytoscapeWeb NetworkModel */
		
	var schema = {
			nodes: [ { name: "label", type: "string"},
					 { name: "systematicName", type: "string"},
					 { name: "geneDescription", type: "string", defValue: ""},
					 { name: "GO_SLIM_FUNCTION", type: "list", defValue: []},
					 { name: "GO_SLIM_PROCESS", type: "list", defValue: []},
					 { name: "GO_SLIM_COMPONENT", type: "list", defValue: []}
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
		/* Sadly I cannot get a batch from Intermine without creating a list */
		for(gene in genes) {
			IMBedding.loadQuery(
		{  	 
	 	   	name:        "Gene_Interaction_Single",
	   	 	constraint1: "Gene",
	    	op1:         "LOOKUP",
	    	value1:      gene,
	    	format:      "jsonpobjects"
	  },
	  function ( data ) {
	  	addNetwork(data);
	  	/*getGo($.map(Nodes,function(val, key) { 
	  		return (val.GO_SLIM_FUNCTION == undefined ? "" : val.systematicName )
	  		})); // map here is unnecessary  */
		CSWnetwork = convertJSON();
		reDraw(defLayout, defStyle, CSWnetwork);
	  }
	);
			
		}
}

function getGeneList() {
	IMBedding.loadQuery(
		{
			model: "genomic",
			view:	["Gene.secondaryIdentifier","Gene.symbol"],
			sortOrder: "Gene.symbol asc",
			constraints: [
					{ path: "Gene.featureType", op: "=", value: "ORF"},
			]
		},
		{ format: "jsonpobjects"},
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
function getGeneListTemplate() {
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
