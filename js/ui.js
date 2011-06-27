// function to set up filters
var filters = new Array();
var nodeColors = {};
var waitingNetwork;

function resetFilters() {
 	$('.edgeFilter').each(function() {
     	   
	   filters[$(this).attr('id')] = true;
      	   $(this).attr('checked', true);
        });

 	$('.typeFilter').each(function() {
     	   
	   filters[$(this).attr('id')] = true;
      	   $(this).attr('checked', true);
        });    

/*	$('.property input').each(function() {
	   $(this).val(nodeColors[$(this).attr('id')]);
	});
*/   
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

function set_property(viz_objects, filter, value, property) {

    // note: viz_objects = "nodes" and property = "color" ignored for now
    // filter is BP slim term selected, value is color
    var style = vis.visualStyle();		         
    vis["nodeColorGoMapperSelect"] = function(data) {
	if (!(_.isArray(data.GO_SLIM_biological_process)) || data.GO_SLIM_biological_process.length == 0) {
            return "#CCCCCC";
	}
	var current = vis.node(data.id).color;  
	var match = _.intersect(_.map(data.GO_SLIM_biological_process, function(bp){ return bp.replace(/ /g,"_");}), _.keys(nodeColors));
	if (match.length == 0) {
	    return current;
	}
	var colors = _.map(match,
			    function(bp_id) { 
				return nodeColors[bp_id];
			      });

        return colors[0];
    };
    style.nodes.color = { customMapper: { functionName: "nodeColorMapperSelect" } };
    vis.visualStyle(style);
}

// Info DIV
function showGo(goInfo, aspect) {

     var goRows = "";

     for (var i=0; i < goInfo.length; i++) {
	 var term = goInfo[i];
	 if (term != aspect) {  // skip unknowns
	    goRows += "<tr><th></th><td>" + term + "</td></tr>";
	 }
     }

     if (goRows == "") {
	goRows += '<tr><th></th><td><span class="i">Unknown</span></td></tr>';
     }

     return goRows;
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

     getGO([info.systematicName]); // NON FUNCTIONAL BECAUSE QUERY IS ASYNCHRONOUS!!!

     var go =  commonHead;
	 go += "<tr><th>"
     go += "<tr><th>Molecular Function</th><td></td></tr>" + showGo(Nodes[info.systematicName].molecular_function, 'molecular_function');
     go += "<tr><th>Biological Process</th><td></td></tr>" + showGo(Nodes[info.systematicName].biological_process, 'biological_process');
     go += "<tr><th>Cellular Component</th><td></td></tr>" + showGo(Nodes[info.systematicName].cellular_component, 'cellular_component');
     go += "</tbody></table>";


     $("#info_go").html(go);

     var pheno =  commonHead;

     pheno += "<tr><th class='b'>Phenotypes</th><td></td></tr>";
     for (var i=0; i<info.PHENOTYPE.length; i++) { pheno += "<tr><th></th><td>" + info.PHENOTYPE[i] +"</td></tr>";}

     pheno += "</tbody></table>";

     $("#info_pheno").html(pheno);

}

function nodeColor(data) {
    

	if (!(_.isArray(data.GO_SLIM_biological_process)) || data.GO_SLIM_biological_process.length == 0) {
            return "#CCCCCC";
	}
	var current = vis.node(data.id).color;  
	var match = _.intersect(_.map(data.GO_SLIM_biological_process, function(bp){ return bp.replace(/ /g,"_");}), _.keys(nodeColors));
	if (match.length == 0) {
	    return current;
	}
	var colors = _.map(match,
			    function(bp_id) { 
				return nodeColors[bp_id];
			      });

        return colors[0];
	
}



function cytoscapeReady() {


    vis.addContextMenuItem("Delete node", "nodes", function(evt) {
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

    vis.addContextMenuItem("Select first neighbors", "nodes", function (evt) {
			       // Get the right-clicked node:
			       var rootNode = evt.target;
			       
			       // Get the first neighbors of that node:
			       var fNeighbors = vis.firstNeighbors([rootNode]);
			       var neighborNodes = fNeighbors.neighbors;
			       
			       // Select the root node and its neighbors:
			       vis.select([rootNode]).select(neighborNodes);
			   }
			  );

    vis.addContextMenuItem("Radial layout", "none", function () {
			       reDraw({
					  name: "Radial",
					  options: {
					      angleWidth: 360,
					      radius: "auto"
					  }
				      },
				      defStyle,
				      convertJSON());
			   }
			  );

    vis.addContextMenuItem("Tree layout", "none", function () {
			       reDraw({
					  name: "Tree",
					  options: {
					      orientation: "leftToRight",
					      depthSpace: 900,
					      breadthSpace: 30,
					      angleWidth: 30,
					  }
				      },
				      defStyle,
				      convertJSON());
			   }
			  );
    vis.addContextMenuItem("Force-directed layout", "none", function () {
			       reDraw({
					    name: "ForceDirected",
					    options: {
						mass: 300,
						gravitation: -500,
						tension: 0.1,
						restLength: "auto",
						drag: 0.4,
						//iterations: 400 ,
						//maxTime: 20000 ,
						//minDistance: 1,
						//maxDistance: 10000,
						autoStabilize: true
					    }
					},
					defStyle,
					convertJSON());
			   }
			  );


    vis["nodeColorGoMapper"] = function(data) {
	if (!(_.isArray(data.GO_SLIM_biological_process)) || data.GO_SLIM_biological_process.length == 0) {
            return "#CC00CC";
	}
	var current = vis.node(data.id).color;  
	var match = _.intersect(data.GO_SLIM_biological_process, _.keys(nodeColors));
	if (match.length == 0) {
	    return current;
	}
	var colors = _.map(match,
			    function(bp_id) { 
				return nodeColors[bp_id];
			      });

        return colors[0];
	
    };

    vis["nodeShapeGoMapper"] = function(data) {

	if (!(_.isArray(data.GO_SLIM_molecular_function)) || data.GO_SLIM_molecular_function.length == 0) {
            return "VEE";
	}

	var parallelogram = [ "translation regulator activity", "transcription regulator activity" ];
	var ellipse = [ "carrier activity", "electron carrier activity", "transporter activity", "ion transporter activity", "channel or pore class transporter activity", "permease activity", "protein transporter activity", "integrase activity", "structural molecule activity", "receptor activity", "antioxidant activity" ];
	var triangle = [ "signal transducer activity" ];
	var hexagon = [ "phosphoprotein phosphatase activity" ];
	var octagon = [ "protein kinase activity", "kinase activity" ];
	var rectangle = [ "enzyme regula`tor activity", "chaperone regulator activity", "motor activity"];
	var roundrect = [ "RNA binding", "DNA binding", "nucleic acid binding",, "binding", "protein binding"];
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


}