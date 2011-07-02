var physicalIntsColor = "#6262FC";
var geneticIntsColor  = "#2FB56D";

var banList = ['NAB2','UBI4','GIS2','RPN11','HEK2','SMT3','SSB1','RPN10','YGL122C','YLL039C','YNL255C','YFR004W','YBL032W','YDR510W','YDL229W','YHR200W','RPN1',
'HSP82','YPL240C','YHR027C','UBP3','YER151C','RSP5','YER125W'];
							      

var defStyle = {
	global: {
		backgroundColor:  	"#FFFFCC"
	},
	nodes: {
		color: {
		    customMapper: {
			functionName: "nodeColorGoMapper"	}
	        },
		size:				50,
		borderWidth:	 	3,	
		borderColor: {
		    customMapper: {
			functionName: "customNodeBorder"
		    }
		},
	        labelFontWeight: 	"bold",
                shape:                  {
		    customMapper: {
			functionName: "nodeShapeGoMapper"
		    }
		},
	        tooltipText: {
		    customMapper: {
			functionName: "customTooltip"
	            }
		},
	        selectionGlowStrength: 40,
	        selectionGlowColor: "#FF8000"
	},
	edges: {
	        width: {
		        continuousMapper: {attrName: "weight",minValue: 1, maxValue: 12, maxAttrValue: 6}
			                
		},
		color:	{
		    customMapper: {
			functionName: "customEdgeColorMapper"
		    }
/*			discreteMapper:  {	
					attrName: 	"interactionClass",
					entries:	[ { attrValue: "physical interactions", value: physicalIntsColor },
								  { attrValue: "genetic interactions",  value: geneticIntsColor  }]
			}*/
						
		},
	        tooltipText: {
		    passthroughMapper: {
			attrName: "label"
		    }
		},
	        sourceArrowShape: {
		    discreteMapper: {
			attrName:  "experimentType",
			entries: [
			]
		    }
		},
	        targetArrowShape: {
		    discreteMapper: {
			attrName:  "experimentType",
			entries: [
			     { attrValue: "Biochemical Activity", value: "DELTA"  },
			     { attrValue: "Affinity Capture-RNA", value: "DIAMOND"  },				 
			     { attrValue: "Protein-RNA", value: "DIAMOND"  }
			]
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


var defBpColors = {

    "cell differentiation": "#993300",
    "cell communication": "#FFCC99",
    "cell death": "#999999",
    "nucleobase, nucleoside, nucleotide and nucleic acid metabolic process": "#00CCFF",
    "macromolecule metabolic process": "#0066FF",
    "extracellular structure organization and biogenesis": "#003300",
    "translation": "#FF6600",
    "cytokinesis": "#9900CC",
    "organelle organization and biogenesis": "#33FF99",
    "regulation of biological process": "#777777",
    "lipid metabolic process": "#0000FF",
    "pathogenesis": "#CCCCCC",
    "vesicle-mediated transport": "#996633",
    "cytoskeleton organization and biogenesis": "#00FF66",
    "pseudohyphal growth": "#996666",
    "secretion": "#663300",
    "cell cycle": "#9966FF",
    "conjugation": "#9933CC",
    "amino acid and derivative metabolic process": "#0033FF",
    "nuclear organization and biogenesis": "#66FF99",
    "DNA metabolic process": "#0066FF",
    "anatomical structure morphogenesis": "#00FF33",
    "sporulation": "#663333",
    "transport": "#FFFF66",
    "RNA metabolic process": "#0066FF",
    "membrane fusion": "#CC9966",
    "generation of precursor metabolites and energy": "#FF33CC",
    "electron transport": "#FF66CC",
    "cell homeostasis": "#996600",
    "cell motility": "#CC9900",
    "protein modification": "#FF9900",
    "ribosome biogenesis and assembly": "#006633",
    "cell budding": "#9933FF",
    "carbohydrate metabolic process": "#3399CC",
    "behavior": "#FF9900",
    "cell wall organization and biogenesis": "#00FF00",
    "transcription": "#FFFF00",
    "response to stress": "#FF6633",
    "meiosis": "#CC66FF",
    "signal transduction": "#FF9933",
    "protein folding": "#669973",
    "protein catabolic process": "FFCCFA",
    "protein modification process": "009999",
    "heterocycle metabolic process": "#00FFFA",
    "aromatic compound metabolic process": "#00CCAA",
    "vitamin metabolic process": "#0000CC",
    "membrane organization and biogenesis": "#336600"
}; 