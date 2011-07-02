// function to set up filters
var filters = new Array();
var nodeColors = {};
var currentColors = {};

var waitingNetwork;

function resetFilters() {

    selectedTerm=''; // resets colors to originals
     
   // resent Slim term counts
   currentTerms = { 
	GO_SLIM_molecular_function: {},
	GO_SLIM_biological_process: {},
	GO_SLIM_cellular_component: {}
    };
    
 	$('.edgeFilter').each(function() {
     	   
	   filters[$(this).attr('id')] = true;
      	   $(this).attr('checked', true);
        });

 	$('.typeFilter').each(function() {
     	   
	   filters[$(this).attr('id')] = true;
      	   $(this).attr('checked', true);
        });    


}

function edge_toggle(type) {
 
	filters[type] = !filters[type]; // invert state
	var show = filters[type];

	vis.filter("edges", function(n) {
		var label = n.data.experimentType;
		var spaceRegex = / /g;
		if (label.replace(spaceRegex,"") == type) {
			return show;
		} else {
			return n.visible;
		}
	});

}


// utilities for farbtastic and color pickers
function position_at_input(picker, input){
    $(picker).css({
	position: "absolute",
	left: $(input).offset().left,
	top: $(input).offset().top + $(input).outerHeight()
    });

    if( $(picker).offset().top + $(picker).outerHeight() > $(window).height() ){
	$(picker).css({
	    top: $(input).offset().top - $(picker).outerHeight()
	});
    }       
}

function hide_with_input(picker, input, fn){
	if ($(picker).find(".header").is(":visible")) {
		// IE set focus to picker, forcing a blur on input, so blur cannot be used here.
		// Let's just create a close button instead:
		$("#colour_picker .ui-icon-close").bind("click", function(evt){
			fn();
			evt.preventDefault();
		});
	} else {
		// Regular GOOD browsers!
		$(input).bind("blur", function(){
		fn();
	    });
	}

    $(parent).parent().bind("scroll", function(){
	fn();
    });

    $(window).bind("resize", function(){
	fn();
    });

}

// add colour pickers
var picker; // parent div to farbtastic
var picker_internals; // farbtastic instance

function remove_picker(){
    if( picker != undefined ){
	$(picker).remove();
	picker = undefined;
	picker_internals = undefined;
    }
}

function valid_value(value, type){
    switch( type ) {
	case "colour":
	    return value.match(/^(\#)([0-9]|[a-f]|[A-F]){6}/);
	case "number":
	    return value.match(/^(-){0,1}([0-9])+((\.)([0-9])+){0,1}/);
	case "per cent number":
	    return value.match(/^((1)|(0)((\.)([0-9])+){0,1})/);
	case "integer":
	    return value.match(/^([0-9])+/);
	case "string":
	    return true;
	case "non-empty string":
	    return value != null && value != "";
	case "node shape":
	    return value.match(/^(ellipse)|(diamond)|(rectangle)|(triangle)|(hexagon)|(roundrect)|(parallelogram)|(octagon)|(vee)|(v)/i);
	case "edge shape":
	    return value.match(/^(circle)|(diamond)|(delta)|(arrow)|(T)|(none)/i);
    }

    return false;
}


function set_node_color(term, color) {
    
    selectedTerm = term;
    nodeColors[term] = color;
    
    var style = vis.visualStyle();		         
    style.nodes.color = { customMapper: { functionName: "nodeColorGoMapper" } };
    vis.visualStyle(style);

}

// Info DIV
function showGo(id) {


    function goRows(id, aspect) {

	var rows = "";
	var data = Nodes[id][aspect];

	_.each(data, function(term) {
		   if (term != aspect) {  // skip unknowns
		       rows += "<tr><th></th><td>" + term + "</td></tr>";
		   }
	       });
	if (rows == "") {
	    rows += '<tr><th></th><td><span class="i">Unknown</span></td></tr>';
	}

	return rows;
    }	   

    var go =  "<table class='summary_mini'><tbody>";
    go += "<tr><th>";
    go += "<tr><th>Molecular Function</th><td></td></tr>" + goRows(id, 'molecular_function');
    go += "<tr><th>Biological Process</th><td></td></tr>" + goRows(id, 'biological_process');
    go += "<tr><th>Cellular Component</th><td></td></tr>" + goRows(id, 'cellular_component');
    go += "</tbody></table>";


    $("#info_go").html(go);

}

function displayGeneProps(info) {

    var commonHead = "<table class='summary_mini'><tbody>";
    var hasGeneName = false;
    if (info.label != info.systematicName) {
	commonHead += "<tr><th>Standard Name</th><td>" + info.label + "</td></tr>";
	hasGeneName = true;
    } else {
	commonHead += "<tr><th>Systematic Name</th><td>" + info.systematicName + "</td></tr>";
    }
    var basic = commonHead;
    if (hasGeneName) {
	basic += "<tr><th>Systematic Name</th><td>" + info.systematicName + "</td></tr>";
    }
    basic += "<tr><th>Name Description</th><td>" + info.geneDescription + "</td></tr>";

    /*var pathways = ""
     for (var i=0; i<info.PATHWAY.length; i++) { if(info.PATHWAY[i]) { pathways += "<tr><th></<th><td>" + info.PATHWAY[i] + "</td></tr>";} }

     if (pathways != "") {
	  basic += "<tr><th class='b'>Pathways</th><td></td></tr>";
	  basic += pathways;

     }
     */
     basic += "</tbody></table>";

     $("#info_basic").html(basic);

     if (Nodes && Nodes[info.systematicName] && Nodes[info.systematicName].go) {
	 showGo(info.systematicName);	     
     } else { 
	 getGO([info.systematicName]); // NON FUNCTIONAL BECAUSE QUERY IS ASYNCHRONOUS!!!
     }
 
     var pheno =  commonHead;

     pheno += "<tr><th class='b'>Phenotypes</th><td></td></tr>";
     for (var i=0; i<info.PHENOTYPE.length; i++) { pheno += "<tr><th></th><td>" + info.PHENOTYPE[i] +"</td></tr>";}

     pheno += "</tbody></table>";

     $("#info_pheno").html(pheno);
     // would like to click something to open the accordiion but not sure how!
}

function statNetwork() {
    $("#nnodes").html(_.keys(Nodes).length );
    $("#nedges").html(_.keys(Edges).length );

}

function cytoscapeReady() {


    vis.addContextMenuItem("Delete node (and add to ban list)", "nodes", function(evt) {
			       if(!delete Nodes[evt.target.data.id]) {
				    alert ("Could not delete "+evt.target.data.id);
			       }
			       _.each(Edges, function(edge,key) {
				      if (edge.source == evt.target.data.id || edge.target == evt.target.data.id) delete Edges[key];
				      }
				     );
			       statNetwork();
			       banList.push(evt.target.data.id);
			       vis.removeNode(evt.target, true);
			   });

    vis.addListener("click", "nodes", function(evt) {
			displayGeneProps(evt.target.data);
			        // needs to change to wait for getGo
				// to finish before.  Move div update
				// into ajax callback.
		    
		    });

    vis.addListener("dblclick", "nodes", function (evt) {
			var type = "physical interactions";
			if (!waitingNetwork) {
			    waitingNetwork = true;
			    getInts(evt.target.data.id, type, false, function(genes,genes, type, goFunc){ fillNetwork(genes,genes,type,goFunc)});
			    
			}
			// note: last functioni in chain must add the listener back!
		    });

    function neighborHilite(node) {
	// Get the first neighbors of that node:
	var fNeighbors = vis.firstNeighbors([node]);
	var neighborNodes = fNeighbors.neighbors;
	
	// Select the root node and its neighbors:
	vis.select([node]).select(neighborNodes);
	
    }

    vis.addListener("mouseover","nodes", function(evt) {
			neighborHilite(evt.target);
		    }
		   );

    vis.addListener("mouseout","nodes", function(evt) {
			vis.deselect("nodes");
		    }
		   );

    vis.addContextMenuItem("Select first neighbors", "nodes", function (evt) {
			       // Get the right-clicked node:
			       neighborHilite(evt.target);

			   }
			  );

    vis.addContextMenuItem("Radial layout", "none", function () {

			       vis.layout({
					  name: "Radial",
					  options: {
					      angleWidth: 360,
					      radius: "auto"
					  }
					  });
			       });

    vis.addContextMenuItem("Tree layout", "none", function () {

			       vis.layout({
					  name: "Tree",
					  options: {
					      orientation: "leftToRight",
					      depthSpace: 900,
					      breadthSpace: 30,
					      angleWidth: 30,
					  }
				      });
			   }
			  );

    vis.addContextMenuItem("Force-directed layout", "none", function () {
			       vis.layout({
					    name: "ForceDirected",
					    options: {
						mass: 30,
						gravitation: -5,
						tension: 0.1,
						restLength: "auto",
						drag: 0.4,
						weightAttr: "weight",
						weightNorm: "linear",
						maxTime: 6000 ,
						iterations: 400 ,
						minDistance: 25,
						maxDistance: 1000,
						autoStabilize: true
					    }
					});
			   }
			  );


    vis["nodeColorGoMapper"] = function(data) {
	    if (!(_.isArray(data.GO_SLIM_biological_process)) || data.GO_SLIM_biological_process.length == 0 || data.id == undefined) {
		//console.log("BP empty");
		return "#CCCCCC";
	    }
	try{
	    var current = vis.node(data.id).color;  
	} catch (x) {
	    var current = currentColors[data.id] || "#222222"; // try to catch undefined BP slims		
	}

	if (selectedTerm == '') {
	   
	    var match = _.intersect(data.GO_SLIM_biological_process, _.keys(nodeColors));
	    if (match.length == 0) {
		//console.log("BP mismatch");
		//console.log(data.GO_SLIM_biological_process);
		return current;
	    }
	    var colors = _.map(match,
				function(bp_id) { 
				    return nodeColors[bp_id];
				  });

	    currentColors[data.id] = colors[0];

	} else if (selectedTerm == 'ALL_nodes' || _.include(data.GO_SLIM_biological_process, selectedTerm )) {

	    currentColors[data.id] = nodeColors[selectedTerm];

	}	    
	return currentColors[data.id];
	
    };

    vis["nodeShapeGoMapper"] = function(data) {

	if (!(_.isArray(data.GO_SLIM_molecular_function)) || data.GO_SLIM_molecular_function.length == 0 || data.GO_SLIM_molecular_function === ['None']) {
            return "VEE";
	}

	var parallelogram = [ "DNA binding", "translation regulator activity", "transcription regulator activity" ];
	var ellipse = [ "carrier activity", "electron carrier activity", "transporter activity", "ion transporter activity", "channel or pore class transporter activity", "permease activity", "protein transporter activity", "integrase activity", "structural molecule activity", "receptor activity", "antioxidant activity" ];
	var triangle = [ "signal transducer activity" ];
	var hexagon = [ "phosphoprotein phosphatase activity" ];
	var octagon = [ "protein kinase activity", "kinase activity" ];
	var rectangle = [ "enzyme regula`tor activity", "chaperone regulator activity", "motor activity"];
	var roundrect = [ "RNA binding", "nucleic acid binding",, "binding", "protein binding"];
	var diamond = [ "hydrolase activity", "isomerase activity", "lyase activity", "aromatase activity", "helicase activity", "transferase activity", "catalytic activity", "ligase activity", "peptidase activity", "oxidoreductase activity", "nucleotidyltransferase activity" ];

	if ( _.intersect(octagon, data.GO_SLIM_molecular_function).length > 0 ) {
		 return "OCTAGON";
	}
	if ( _.intersect(hexagon, data.GO_SLIM_molecular_function).length > 0 ) {
		 return "HEXAGON";
	}
	if ( _.intersect(parallelogram, data.GO_SLIM_molecular_function).length > 0 ) {
		 return "PARALLELOGRAM";
	}
	if ( _.intersect(triangle, data.GO_SLIM_molecular_function).length > 0 ) {
		 return "TRIANGLE";
	}
	if ( _.intersect(diamond, data.GO_SLIM_molecular_function).length > 0 ) {
		 return "DIAMOND";
	}
	if ( _.intersect(rectangle, data.GO_SLIM_molecular_function).length > 0 ) {
		 return "RECTANGLE";
	}
	if ( _.intersect(roundrect, data.GO_SLIM_molecular_function).length > 0 ) {
		 return "ROUNDRECT";
	}
	return "ELLIPSE";
	
			       
    };
			         
   vis["customTooltip"] = function (data) {
	if ( (!(_.isArray(data.GO_SLIM_molecular_function)) || data.GO_SLIM_molecular_function.length == 0) &&
	     (!(_.isArray(data.GO_SLIM_biological_process)) || data.GO_SLIM_biological_process.length == 0) &&
	     (!(_.isArray(data.GO_SLIM_cellular_component)) || data.GO_SLIM_cellular_component.length == 0) )
            { return "No slim data";
	}

	var slimData = "SLIM FUNCTION: " + data.GO_SLIM_molecular_function.toString();	
	slimData += "\nSLIM PROCESS: " + data.GO_SLIM_biological_process.toString();	
	slimData += "\nSLIM COMPONENT: " + data.GO_SLIM_cellular_component.toString();
	
	return slimData;
    };

    vis["customNodeBorder"] = function (data) {
	// black listed genes have black border
	if(_.detect(banList, function(banned) {  return banned == data.id; })){
		return "#000000";
	} else { 
	    return "#AAAABB";
        }
    };

    vis["customEdgeColorMapper"] = function (data) {
	if (data.experimentType == 'Biochemical Activity') {
	    return "#000000";
	} else if (data.experimentType.search('RNA') >= 0) {
	    return "#773300";
	} else if (data.experimentType == 'Two-hybrid') {
	    return "#CCCCCC";
	} 

	if (data.interactionClass == 'physical interactions') {
	    return physicalIntsColor;
	} else {
	    return geneticIntsColor;
	}
    };
    
}