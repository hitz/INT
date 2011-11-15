/**
 * Network + Node and Edge objects
 * @author Benjamin Hitz
 */
// require() underscore, jquery!!!
var Node = function(data){

	// I suppose I should qualify type of objecct, etc..
	return data;
}

var Edge = function(data){
	
	return data;
}

var Network = function(initData) {

	/* definition of schema for CSW network 
	 *  Needs to be generalized for other network (pathway, GI, etc.)
	 */
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
	
	/* list of nodes not to expand / both gene (symbol) and systematic names are included  */
	var banList  = ['NAB2','UBI4','GIS2','RPN11','HEK2','SMT3','SSB1','RPN10','YGL122C','YLL039C','YNL255C','YFR004W','YBL032W','YDR510W','YDL229W','YHR200W','RPN1',
'HSP82','YPL240C','YHR027C','UBP3','YER151C','RSP5','YER125W'];

	var nodes = {};
	var edges = {};
	var initialWeight = 1.0; // initial weight of edges, increased by counting
	if (initData.interactions != undefined && _.isArray(initData.interactions)) rootId = this.createNetwork(initData);
	

	function createNetwork(data) {
		this.nodes = {};
		this.edges = {};
		rootId = this.addNetwork(data);
	}
	
	function addNetwork(root) {
	/* This adds all "new" nodes and new edges by ID into a graph */
	
		if(this.nodes[root.secondaryIdentifier] == undefined) {
				this.nodes[root.secondaryIdentifier] = new Node({
					geneDescription:	root.description,
					systematicName:		root.secondaryIdentifier,
					label:				root.symbol,
					id:					root.secondaryIdentifier,
					headline:			root.headline
				});
			}
				
		var e = {}; // local edges
		for ( i=0;i<root.interactions.length;i++) { // have to use real for loop here because of continue!

			inx = root.interactions[i];
			var igene = inx.interactingGenes.pop(); // theoretically could be more than one!
			if (this.nodes[igene.secondaryIdentifier] == undefined ) {
				var trueName = ( igene.symbol == undefined ? igene.secondaryIdentifier: igene.symbol);
				this.nodes[igene.secondaryIdentifier] = new Node({
						id:					igene.secondaryIdentifier,	
						label: 				trueName,
						systematicName: 	igene.secondaryIdentifier,
						geneDescription: 	igene.description,
						headline:			igene.headline
				});
			}
			var pair = [igene.secondaryIdentifier, root.secondaryIdentifier].sort();
	        // note: pubmedid is not stored but used for counting purposes

	        var src = root.secondaryIdentifier;
	        var targ = igene.secondaryIdentifier;
	        if (inx.role == 'Bait') {
		    // reverse source and target for directed edges
			    var tmp = src;
			    src = targ;
		    	targ = tmp;
			}
			
		    var key = pair[0]+pair[1]+inx.experiment.name;
		    if(this.edges[key]) { continue; }

			if (e[key] == undefined) {
			    w = this.initialWeight;
				e[key] = new Edge({
				    id:					key,
				    label:				inx.experiment.name,
				    experimentType:	    inx.experiment.name,
				    interactionClass:	inx.interactionType,
				    source:				src,
				    target: 		    targ,
				    weight:             w
				});
			} else {
		    //(inx.role == 'Self' ? e[key].weight += 1.0 : e[key].weight += 0.5);  // non-self-interactions are double-counted by fillNetwork
			    e[key].weight += 1.0;
			    e[key].label = inx.experiment.name + " ("+e[key].weight+")";
			}
		}
		_.extend(this.edges,e);
        return root.secondaryIdentifier;
	    //TODO: ui should call Network.statNetwork()
	}
		
	return { // public functions
		createNetwork: function(data) {return createNetwork(data)},
		addNetwork: function(rootNode) { return addNetwork(rootNode)},
		schema: function() {return schema},
		banList: function() {return banList},
		Nodes: function() {return nodes },
		Edges: function() {return edges },
	    convertJSON: function() {
		/* convert YeastMine JSON into CytoscapeWeb NetworkModel */
 		 	return {
				dataSchema:	schema,
				data: {
					nodes: $.map(nodes, function(value, key) { return value; }),
					edges: $.map(edges, function(value, key) { return value; })
				}
			};
		}
	}
}