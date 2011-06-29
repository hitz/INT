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
var currentTerms = {
	// tracks slim terms and counts for each node added to network
	GO_SLIM_molecular_function: {},
	GO_SLIM_biological_process: {},
	GO_SLIM_cellular_component: {}
}
var rootId;
var CSWnetwork = {};
/* use hash to keep track of current network */

function getGO(genes) {
		/* Get GO data for an array of genes */
                
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

				   try {
				       var annot = _.reduce(gene.goAnnotation,
							    function(a,ga) {
								if (ga.ontologyTerm.namespace != undefined) { // bad yeastmine loading of null aspects!
								    a[ga.ontologyTerm.namespace].push(ga.ontologyTerm.name);								    
								}
								return a;
							    },
							    {
								go: true,
								molecular_function: [],
								biological_process: [],
								cellular_component: [],
							    }
							   );
 				       _.extend(Nodes[gene.secondaryIdentifier],annot);

				   } catch (x) {
				       alert("getGO error: "+x+" "+gene.secondaryIdentifier+" "+ga.onotologyTerm.name);
				   }
		             showGo(gene.secondaryIdentifier);
		             // as of now, the "real" nodes don't have the full GO terms but we could add them here with vis.updateData
		       }
	              );
		     }
		 );
}

function getInts(gene, filter, create, nextRequest) {
		/* given some arguments (gene names, network type, edge type) fetch interactions from YeastMine via webservices */
        var query = 	    {  	 
	 	name:        "Interactions_network",
	   	constraint1: "Gene",
	    	op1:         "LOOKUP",
	    	value1:      gene,
	    	format:      jsonMethod
	  };
        if (filter != undefined) {
	    var f = {
		constraint2: "Gene.interactions.interactionType",
		op2: "=",
		value2: filter
	    };
	    _.extend(query,f);
	}

        if (nextRequest instanceof Function == false) {
	    nextRequest = function() {};	    
	}
	IMBedding.loadTemplate(
	   query,
	  function ( data ) {
	  	rootId = addNetwork(create, data.results.pop());
	        var neighbors = _.select(_.keys(Nodes), function(k) { return k != rootId});
	        //alert("got ints, getting go")
	        //console.log(neighbors);
	        nextRequest(neighbors, neighbors,filter, function(genes) { getGOSlim(genes) });

	  }
	);
}

function fillNetwork(geneList1, geneList2, filter, nextRequest) {

        //alert("Creating Query");
        _.each(banList, function(banned) {
		   geneList1 = _.without(geneList1,banned);
		   geneList2 = _.without(geneList2,banned);
		   });
        var query = {
		    model: "genomic",
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
			   "Gene.interactions.experiment.name",
			   "Gene.interactions.experiment.publication.pubMedId",
			   "Gene.interactions.id"],
		    constraints: [
		           { path: "Gene.secondaryIdentifier", op: "ONE OF", values: geneList1 },
			   { path: "Gene.interactions.interactingGenes.secondaryIdentifier", op: "ONE OF", values: geneList2 }
		    ]
		};

         if (filter) {
	     query.constraints.push(
		           { path: "Gene.interactions.interactionType", op: "=", value: filter }
	     );
	 }

         //alert("Filling Network");
         var qXml = IMBedding.makeQueryXML(query);
         //alert(qXml);

         $.ajax({
	       type: "POST",
	       url: queryUrl,
 	       dataType: "json" ,
	       data:   {
		      query:  qXml,
		      format: jsonMethod,
		  },
 	       failure: function(jqXHR, status) {
		   alert("fill Network: "+status);
	       },
	       success:  function( data ) {
		   //alert("fill Network: Success!");
		   
		   _.each(data.results, function(root) {
		       
		       var rootID = addNetwork(false, root);

			      });

		   nextRequest(_.keys(Nodes));
		}
	});
	
}

function addNetwork(create, root) {

	/* This adds all "new" nodes and new edges by ID into a graph */

	//var root = graph.results.pop(); // first item in array.

        if(create == true) {
	    // new network
	    Nodes = {};
	    Edges = {};
	}
	
	if(Nodes[root.secondaryIdentifier] == undefined) {
		Nodes[root.secondaryIdentifier] = {
			geneDescription:	root.description,
			systematicName:		root.secondaryIdentifier,
			label:				root.symbol,
			id:					root.secondaryIdentifier,
			headline:			root.headline
		};
	}
	
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
	        // note: pubmedid is not stored but used for counting purposes
	        var key = pair[0]+pair[1]+inx.experiment.name;
		if (Edges[key] == undefined) {
			Edges[key] = {
			    id:					"-"+inx.objectId,
			    label:				inx.experiment.name,
			    experimentType:	        	inx.experiment.name,
			    interactionClass:	                inx.interactionType,
			    source:				root.secondaryIdentifier,
			    target: 		         	igene.secondaryIdentifier,
			    weight:                             2
			};
		} else {
		    Edges[key].weight += 2;
		}
	}
        $("#nnodes").html(_.keys(Nodes).length );
        $("#nedges").html(_.keys(Edges).length );
        return root.secondaryIdentifier;
	//console.log(Edges);
}
function reDraw(layout, style, graph){

                //alert("Drawing..");
                //vis.ready( function () { cytoscapeReady() });
		vis.draw({
			     layout: layout,
			     network: graph,
			     visualStyle:  style,
			     //edgesMerged:  true,
 			     edgeTooltipsEnabled: true,
			     nodeTooltipsEnabled: true,              
		});
		
		//resetFilters();

}

function convertJSON() {
	/* convert YeastMine JSON into CytoscapeWeb NetworkModel */

        //alert("converting network to CSW JSON");
		
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
					 { name: "cellular_component", type: "list", defValue: []},
					 { name: "go", type: "boolean", defValue: false}
					],
			edges: [ { name: "label", type: "string"},
					 { name: "experimentType", type: "string"},
					 { name: "directed", type: "boolean", defValue: false},
					 { name: "weight", type: "number", devValue: 1.0},
					 { name: "interactionClass", type: "string"},
					 { name: "publication", type: "string"}
				   ]
	};
	
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
			        $.when( createNetwork(ui.item.value,"physical interactions") )
			          .done(function() {
					    //CSWnetwork = convertJSON();
					    //reDraw(defLayout, defStyle, CSWnetwork);

	        		/*	    $.when(getGOSlim(_.select(_.keys(Nodes), function(k) { return k != rootId})))
					    .done(function(){
						  }
						 )
					    .fail(function(){
						  alert("Go fetch failed")
						  });*/
					})
		    		  .fail(function() {
					alert("Network creation failed")
					});
			}
						      
    	        
		});
		}
);
}

function createNetwork(hub, type) {
    resetFilters();
    return getInts(hub, type, true, function(genes,genes, type,goFunc){ fillNetwork(genes,genes,type,goFunc)});
}

function getGOSlim (genes) {

    // NOTE: 'ONE OF' / values: query must be LAST in the constraints: array!!
    //console.log(genes);
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
	       complete: function (data) {
		   waitingNetwork = false;
	       },
	       success:  function( data ) {

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
						    _.extend(slim[aspect],terms);
						});

					 
 				     });
			      _.each(slim, function(val, key) {
					 
					 _.each(val,function(n,term) {
						    if(currentTerms[key][term] == undefined) {
							currentTerms[key][term] = 1;
						    } else {
							currentTerms[key][term]++;
						    }
						});

					 annot[key] = _.keys(val);
				     });

			      _.extend(Nodes[gene.secondaryIdentifier],annot); 
			  });
		   var tot = _.reduce(_.values(currentTerms.GO_SLIM_biological_process),function(num,memo){ return num+memo;},0);
		   CSWnetwork = convertJSON();
		   // draw process colors as set
		   $(document).find('.property input').each(function(){
					var n = ( currentTerms.GO_SLIM_biological_process[$(this).attr('name')] != undefined ? 
						  currentTerms.GO_SLIM_biological_process[$(this).attr('name')] : 0) ;
					if(n > 0 ) {
					    $(this).parent('div.property').css('display','block');
					    $(this).parent('div.property').find('label span.i').each(function(){$(this).html('['+ n + '] ')});
					} else if ($(this).attr('name') != 'ALL_nodes') {
					    $(this).parent('div.property').css('display','none');
					}
							    });
		   reDraw(defLayout, defStyle, CSWnetwork);

              }
		  
	   });
}

