var physicalIntsColor = "#6262FC";
var geneticIntsColor  = "#2FB5FC";

var defStyle = {
	global: {
		backgroundColor:  	"#FFFFCC"
	},
	nodes: {
		color:		 		"#555555",
		size:				50,
		shape:			 	"PARALLELOGRAM",
		borderWidth:	 	3,	
		borderColor:		"#AAAABB",
		labelFontWeight: 	"bold"
	},
	edges: {
		width: 3,
		color:	{	
			discreteMapper:  {	
					attrName: 	"interactionClass",
					entries:	[ { attrValue: "physical interactions", value: physicalIntsColor },
								  { attrValue: "genetic interactions",  value: geneticIntsColor  }]
			}
						
		}
		
	}
}

