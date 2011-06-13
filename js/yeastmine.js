//IMBedding.setBaseUrl("http://yeastmine.yeastgenome.org/yeastmine");
IMBedding.setBaseUrl("http://yeastmine-test.yeastgenome.org/yeastmine-dev");
  
var authStr = 'Y2lzY29oaXR6LmNvbTpoYWlyYmFsbA=='; // for user "ciscohitz@gmail.com"
var initialized = false; // set the first time a network is drawn
var Edges = {};
var Nodes = {};
var CSWnetwork = {};
/* use hash to keep track of current network */

function createList() {
/*		data: {
			name: "intList",
			type: "Gene",
			format: "jsonp",
			content: ["PIG1","HOG1","ACT1"]
		},
		
	$.ajax( {
		url: "/INT/list_proxy.pl",
		data: { type: "Gene", name: "intList", list: "PIG1 HOG1 ACT1 HOG1"},
		dataType: 'xml',
		success: function(msg) { console.log(msg) },
		error:   function(error, statusCode) {console.log("Error:", error, statusCode); alert("Sorry - list creation failed\n" + error);},
	})
	*/
	 
	$.jsonp( {
		url: "http://localhost/cgi-bin/list_proxy.pl",
		data: { type: "Gene", name: "intList", list: "PIG1 HOG1 ACT1 HOG1"},
		callbackParameter: 'callback',
		success: function(msg) { console.log(msg) },
		error:   function(error, statusCode) {console.log("Error:", error, statusCode); alert("Sorry - list creation failed\n" + error);},
	})
}
/*		type: "POST",
		headers: {"Authorization:": authStr},
*/	
function getInts(gene) {
		/* given some arguments (gene names, network type, edge type) fetch interactions from YeastMine via webservices */
	IMBedding.loadTemplate(
		{  	 
	 	   	name:        "Interactions_network",
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
			geneDescription:	root.description,
			systematicName:		root.secondaryIdentifier,
			label:				root.symbol,
			id:					root.secondaryIdentifier,
			headline:			root.headline,
		};
	}
	var e = {};
	
	for ( i=0;i<root.interactions.length;i++) {
		inx = root.interactions[i];
		var igene = inx.interactingGenes.pop(); // theoretically could be more than one!
		if (Nodes[inx.interactingGeneFeatureName] == undefined ) {
			var trueName = ( igene.symbol == undefined ? igene.secondaryIdentifier: igene.symbol);
			Nodes[igene.secondaryIdentifier] = {
					id:					igene.secondaryIdentifier,	
					label: 				trueName,
					systematicName: 	igene.secondaryIdentifier,
					geneDescription: 	igene.description,
					headline:			igene.headline
			};	
		}
		var pair = [igene.secondaryIdentifier, root.secondaryIdentifier].sort();
		var key = pair[0]+pair[1]+inx.experiment.name+inx.experiment.publication.pubMedId;
		console.log(key)
		if (Edges[key] == undefined) {
			Edges[key] = {
				id:					"-"+inx.objectId,
				label:				inx.experiment.name,
				experimentType:		inx.experiment.name,
				interactionClass:	inx.interactionType,
				source:				root.secondaryIdentifier,
				target: 			igene.secondaryIdentifier,
				publication:		inx.experiment.publication.pubMedId
			};
		}
	}
	//console.log(Edges);
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
					 { name: "headline", type: "string", defValue: ""},					 
					 { name: "GO_SLIM_FUNCTION", type: "list", defValue: []},
					 { name: "GO_SLIM_PROCESS", type: "list", defValue: []},
					 { name: "GO_SLIM_COMPONENT", type: "list", defValue: []}
					],
			edges: [ { name: "label", type: "string"},
					 { name: "experimentType", type: "string"},
					 { name: "directed", type: "boolean", defValue: false},
					 { name: "weight", type: "number", devValue: 1.0},
					 { name: "interactionClass", type: "string"},
					 { name: "publication", type: "string"}
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
					model: "genomic",
					view: [
						"Gene.secondaryIdentifier",
						"Gene.symbol",
						"Gene.goAnnotation.ontologyTerm.identifier",
						"Gene.goAnnotation.ontologyTerm.name",
						"Gene.goAnnotation.evidence.code.code",
						"Gene.goAnnotation.ontologyTerm.namespace",
						"Gene.goAnnotation.qualifier",
						"Gene.goAnnotation.evidence.publications.pubMedId",
						"Gene.goAnnotation.ontologyTerm.parents.identifier",
						"Gene.goAnnotation.ontologyTerm.parents.name"],
					constraints: [
						{ path: "Gene", op: "LOOKUP", value: gene},
						{ path: "Gene.goAnnotation.ontologyTerm.parents", type: "GOSlimTerm"}
					]
				},
		    	{ format:      "jsonpobjects"},
			  function ( data ) {
	  			console.log(data);
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
