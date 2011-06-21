//IMBedding.setBaseUrl("http://yeastmine.yeastgenome.org/yeastmine");
var devIM = "http://yeastmine-test.yeastgenome.org/yeastmine-dev"
var templateUrl = devIM+"/service/template/results";
var queryUrl = devIM+"/service/query/results";
var jsonMethod = 'jsonobjects'; // for REMOTE server set this to jsonpobjects

IMBedding.setBaseUrl(devIM);
  
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
function getGO(genes) {
		/* Get GO data for an array of genes */
                
                var emptyGenes = _.map(genes,function(v){ if ((Nodes[v]).molecular_function.length() == 0) return v;});                
				var query = {
					model: "genomic",
					view: [
						"Gene.secondaryIdentifier",
						"Gene.symbol",
						"Gene.goAnnotation.ontologyTerm.identifier",
						"Gene.goAnnotation.ontologyTerm.name",
						"Gene.goAnnotation.ontologyTerm.namespace",
						"Gene.goAnnotation.qualifier",
						],
					constraints: [
						{ path: "Gene.secondaryIdentifier", op: "ONE OF", values: genes}
					]
				};

                 IMBedding.loadQuery(
		     query,
		     {format: jsonMethod},
		     function( data ) {
			$.each(data.results, function(i,gene) {

			     var annot = _.reduce(gene.goAnnotation,
				 function(a,ga) {
				     a[ga.ontologyTerm.namespace].push(ga.ontologyTerm.name);
				     return a;
				 },
			         {
				 molecular_function: [],
				 biological_process: [],
				 cellular_component: [],
			         }
			       );
//			     $.each(annot,function(val, key) { annot[key] = _.uniq(val)});
 			     _.extend(Nodes[gene.secondaryIdentifier],annot);
//			     vis.updateData("nodes",[gene.secondaryIdentifier],annot);
		             // No need to actually update the vis object yet
			 
		       }
	              );
		     }
		 );
}

function getInts(gene, nextRequest) {
		/* given some arguments (gene names, network type, edge type) fetch interactions from YeastMine via webservices */
	IMBedding.loadTemplate(
	    {  	 
	 	name:        "Interactions_network",
	   	constraint1: "Gene",
	    	op1:         "LOOKUP",
	    	value1:      gene,
	    	format:      jsonMethod
	  },
	  function ( data ) {
	  	var rootId = addNetwork(data);
	        var neighbors = _.select(_.keys(Nodes), function(k) { return k != rootId});
	        nextRequest(_.keys(Nodes));
//	        fillNetwork(neighbors, neighbors);
//		    addNetwork(data);
		    CSWnetwork = convertJSON();
		    reDraw(defLayout, defStyle, CSWnetwork);
	  }
	);
}

function fillNetwork(geneList1, geneList2) {
	IMBedding.loadQuery(
		{
		    model: genomic,
		    view: [
			   "Gene.secondaryIdentifier",
			   "Gene.symbol",
			   "Gene.interactions.role",
			   "Gene.interactions.interactingGenes.secondaryIdentifier",
			   "Gene.interactions.interactingGenes.symbol",
			   "Gene.interactions.type.name",
			   "Gene.interactions.interactionType",
			   "Gene.interactions.annotationType",
			   "Gene.interactions.phenotype",
			   "Gene.interactions.experiment.publication.pubMedId",
			   "Gene.interactions.experiment.name",
			   "Gene.interactions.id"],
		    constraints: [
		           { path: "Gene.secondaryIdentifier", op: "ONE OF", values: geneList1 },
			   { path: "Gene.interactions.interactingGenes.secondaryIdentifier", op: "ONE OF", values: geneList2 }
		    ]
		},
		{format: jsonMethod},
		function (data) {
		    addNetwork(data);
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
		if (Nodes[igene.secondaryIdentifier] == undefined ) {
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
        return root.secondaryIdentifier;
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
					 { name: "GO_SLIM_molecular_function", type: "list", defValue: []},
					 { name: "GO_SLIM_biological_process", type: "list", defValue: []},
					 { name: "GO_SLIM_cellular_component", type: "list", defValue: []},
					 { name: "molecular_function", type: "list", defValue: []},
					 { name: "biological_process", type: "list", defValue: []},
					 { name: "cellular_component", type: "list", defValue: []}
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
		{ format: jsonMethod},
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
		    		getInts(ui.item.value, function( genes ) { doit(genes) })

    			}
    	        })
		}
	);
}

function doit (genes) {
/*    var xml = $.ajax({
	url: '/INT/README',
	error: function(status){alert(status)},
	success: function() {alert("chain successful")}
    }).responseText;
*/


    // NOTE: 'ONE OF' / values: query must be LAST in the constraints: array!!
    var query ={
	model: "genomic",
	view: [
	    "Gene.secondaryIdentifier",
	    "Gene.goAnnotation.qualifier",
	    "Gene.goAnnotation.ontologyTerm.parents.identifier",
	    "Gene.goAnnotation.ontologyTerm.parents.name",
	    "Gene.goAnnotation.ontologyTerm.parents.namespace",
	    "Gene.goAnnotation.qualifier",
	],
	constraintLogic:"C and (A or B)",
	constraints: [
	    { path: "Gene.goAnnotation.qualifier", op: "IS NULL", code: "A"},
	    { path: "Gene.goAnnotation.qualifier", op: "!=", value: "NOT", code: "B"},
	    { path: "Gene.goAnnotation.ontologyTerm.parents", type:"GOSlimTerm"},
	    { path: "Gene.secondaryIdentifier", op: "ONE OF", values: genes, code: "C"}
	]
    };
    var qXml = IMBedding.makeQueryXML(query);
    $.ajax({
	       type: "POST",
	       url: queryUrl,
 	       dataType: "json" ,
	       data:   {
		      query:  qXml,
		      format: jsonMethod,
		  },
 	       failure: function(jqXHR, status) {
		   alert("getGO: "+status);
	       },
	       complete: function(jqXHR, status) {
		   
		   alert("getGO: something happened: "
			 + status);
	       },
	       success:  function( data ) {
		   //console.log(data.results);
		   alert("got go: ");
		   $.each(data.results, function(i,gene) {
			      var annot = {};
			      var slim = {
				  GO_SLIM_molecular_function: {},
				  GO_SLIM_biological_process: {},
				  GO_SLIM_cellular_component: {},
			      };
			      
			      $.each(gene.goAnnotation, function(i,ga){
					 //console.log(ga);
					 
					 var par = _.reduce(ga.ontologyTerm.parents,
							     function(a,p) {
								 //console.log(p.namespace+" "+p.name);
								 if(p.namespace != p.name) { a["GO_SLIM_"+p.namespace][p.name] = true}
								 return a;
							     },
							     {
								 GO_SLIM_molecular_function: {},
								 GO_SLIM_biological_process: {},
								 GO_SLIM_cellular_component: {},
							     }
							    );
					 //console.log(par);
					 _.each(par, function(terms,aspect) {
						    //if(!_.isEmpty(terms)) { _.extend(slim[aspect],terms) }
						    _.extend(slim[aspect],terms);
						});
					 
 				     });
			     // console.log(slim);
			      _.each(slim, function(val, key) {
					 annot[key] = _.keys(val);
				     });
			      console.log(gene.secondaryIdentifier);
			      console.log(annot);
			      _.extend(Nodes[gene.secondaryIdentifier],annot); 
			  }); 
              }
	   });
}

function getGeneListTemplate() {
	$.getJSON(
	    templateUrl,
		{	
			name:			"All_Orf_name",
			constraint1:	"Gene.featureType",
			op1:			"eq",
			value1: 		"ORF",
			format:			jsonMethod
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
