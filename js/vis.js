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
		        continuousMapper: {attrName: "weight",minValue: 3, maxValue: 10, maxAttrValue: 6}
			                
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

"ribosomal subunit export from nucleus": "#f01010",
"mitotic cell cycle": "#e21420",
"conjugation": "#f41830",
"cell morphogenesis": "#e61c40",
"cytokinesis": "#f82050",
"invasive growth in response to glucose limitation": "#ea2460",
"cytoplasmic translation": "#fc2870",
"carbohydrate metabolic process": "#ee2c80",
"generation of precursor metabolites and energy": "#203090",
"DNA replication": "#2234a0",
"DNA repair": "#2438b0",
"DNA recombination": "#263cc0",
"chromatin organization": "#2840d0",
"transcription initiation, DNA-dependent": "#2a44e0",
"transcription termination, DNA-dependent": "#2c48f0",
"transcription elongation, DNA-dependent": "#2e4d00",
"transcription from RNA polymerase I promoter": "#305110",
"rRNA processing": "#325520",
"transcription from RNA polymerase II promoter": "#345930",
"transcription from RNA polymerase III promoter": "#365d40",
"mRNA processing": "#386150",
"RNA catabolic process": "#3a6560",
"translational initiation": "#3c6970",
"translational elongation": "#3e6d80",
"regulation of translation": "#407190",
"tRNA aminoacylation for protein translation": "#4275a0",
"protein folding": "#4479b0",
"protein phosphorylation": "#467dc0",
"protein dephosphorylation": "#4881d0",
"protein glycosylation": "#4a85e0",
"protein lipidation": "#4c89f0",
"cellular amino acid metabolic process": "#4e8e00",
"protein targeting": "#509210",
"lipid metabolic process": "#529620",
"vitamin metabolic process": "#549a30",
"ion transport": "#569e40",
"amino acid transport": "#58a250",
"lipid transport": "#5aa660",
"cellular ion homeostasis": "#5caa70",
"exocytosis": "#5eae80",
"endocytosis": "#60b290",
"response to osmotic stress": "#62b6a0",
"response to DNA damage stimulus": "#64bab0",
"response to oxidative stress": "#66bec0",
"nucleus organization": "#68c2d0",
"mitochondrion organization": "#6ac6e0",
"cytoskeleton organization": "#6ccaf0",
"peroxisome organization": "#6ecf00",
"vacuole organization": "#70d310",
"chromosome segregation": "#72d720",
"cell budding": "#74db30",
"pseudohyphal growth": "#76df40",
"tRNA processing": "#78e350",
"biological_process": "#7ae760",
"protein alkylation": "#7ceb70",
"RNA splicing": "#7eef80",
"carbohydrate transport": "#80f390",
"oligosaccharide metabolic process": "#82f7a0",
"response to heat": "#84fbb0",
"RNA modification": "#86ffc0",
"membrane invagination": "#8903d0",
"nucleobase, nucleoside, nucleotide and nucleic acid transport": "#8b07e0",
"vesicle organization": "#8d0bf0",
"endosome transport": "#8f1000",
"histone modification": "#911410",
"peptidyl-amino acid modification": "#931820",
"signaling": "#951c30",
"regulation of protein modification process": "#972040",
"transposition": "#992450",
"telomere organization": "#9b2860",
"mitochondrial translation": "#9d2c70",
"regulation of organelle organization": "#9f3080",
"response to chemical stimulus": "#a13490",
"ribosome assembly": "#a338a0",
"ribosomal large subunit biogenesis": "#a53cb0",
"ribosomal small subunit biogenesis": "#a740c0",
"response to starvation": "#a944d0",
"snoRNA processing": "#ab48e0",
"protein acylation": "#ad4cf0",
"sporulation": "#af5100",
"cellular respiration": "#b15510",
"Golgi vesicle transport": "#b35920",
"organelle fusion": "#b55d30",
"organelle fission": "#b76140",
"organelle inheritance": "#b96550",
"regulation of transport": "#bb6960",
"regulation of DNA metabolic process": "#bd6d70",
"nuclear transport": "#bf7180",
"cofactor metabolic process": "#c17590",
"meiotic cell cycle": "#c379a0",
"proteolysis involved in cellular protein catabolic process": "#c57db0",
"protein maturation": "#c781c0",
"regulation of cell cycle": "#c985d0",
"transmembrane transport": "#cb89e0",
"nucleobase, nucleoside and nucleotide metabolic process": "#cd8df0",
"membrane fusion": "#cf9200",
"protein complex biogenesis": "#d19610",
"protein modification by small protein conjugation or removal": "#d39a20",
"organelle assembly": "#d59e30",
"cell wall organization or biogenesis": "#d7a240",
/* old BP Slim 
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
    "protein catabolic process": "#FFCCFA",
    "protein modification process": "#009999",
    "heterocycle metabolic process": "#00FFFA",
    "aromatic compound metabolic process": "#00CCAA",
    "vitamin metabolic process": "#0000CC",
    "membrane organization and biogenesis": "#336600" */

}; 