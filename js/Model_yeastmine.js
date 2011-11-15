/**
 * Object that interfaces network with Yeastmine queries
 * @author Benjamin Hitz
 */

var Model = function() {
	
	var type = 'yeastmine';
	var devIM = "http://yeastmine-test.yeastgenome.org/yeastmine-dev";
	var templateUrl = devIM+"/service/template/results";
	var queryUrl = devIM+"/service/query/results";
	var jsonMethod = 'jsonobjects'; // for REMOTE server set this to jsonpobjects

	IMBedding.setBaseUrl(devIM);
  
	var authStr = 'Y2lzY29oaXR6LmNvbTpoYWlyYmFsbA=='; // for user "ciscohitz@gmail.com"

	var rawQuery = {
		go: {
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
		},
		interactions: {
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
		},
		goSlims: {
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
    	}
    };
	
	var templateQuery = {
		interaction: {  	 
		 	name:        "Interactions_network",
		   	constraint1: "Gene",
	    	op1:         "LOOKUP",
	    	value1:      gene,
	    	format:      jsonMethod
	  	},
	  	geneList: {
			model: "genomic",
			view:	["Gene.secondaryIdentifier","Gene.symbol"],
			sortOrder: "Gene.symbol asc",
			constraints: [
					{ path: "Gene.featureType", op: "=", value: "ORF"},
			]
	  	}
	};
	
	
	return {
		getGO: function(geneList,callback, nextRequest){},
		getInts: function(rootNode,filter,callback, nextRequest){},
		fillNetwork: function(geneListA,geneListB,filter,callback, nextRequest){},
		getGeneList: function(callback,nextRequest){},
		getGOSlim: function(geneList,callback,nextRequest){},
		
	};
}
