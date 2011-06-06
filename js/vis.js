var physicalIntsColor = "#6262FC";
var geneticIntsColor  = "#2FB56D";

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
};

var defLayout = {
			  name: "ForceDirected",
			  
/*
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
				*/
};
