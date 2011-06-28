/* globals */

/*if (console == null || typeof(console) == undefined) {
        console = {log: function() {}};
}*/

var div_id = "cytoscapeweb";
// initialization options
var options = {
	// where you have the Cytoscape Web SWF
	swfPath: "/INT/swf/CytoscapeWeb",
	// where you have the Flash installer SWF
	flashInstallerPath: "/INT/swf/playerProductInstall"
};

var vis = new org.cytoscapeweb.Visualization(div_id, options);

var selectedTerm = '';

// ON LOAD
$(function() {

     getGeneList(); 
     // template might be is slightly faster
     // sets up gene list autocomplete

    // set up edge coloring checkboxes (unimplemented!!)
    $(".edgeFilter").change(function() {

    	edge_toggle($(this).attr('id'));

    });
  
    $("#geneticinteractions").change(function(){

       var type;
       var state = $(this).attr('checked');
       $('.genetic').each(function(n) {
            if($(this).attr('checked') != state) {
	         edge_toggle($(this).attr('id'));
		 $(this).attr('checked', state);
	   }
       });
    });

    $("#physicalinteractions").change(function(){

       var type;
       var state = $(this).attr('checked');
       $('.physical').each(function(n) {
            if($(this).attr('checked') != state) {
	         edge_toggle($(this).attr('id'));
		 $(this).attr('checked', state);
	   }
       });
     });
 
      var nc = $('#node_color'); // get the div
      _.each(defBpColors, function(color,term) { 
	     var term_id = term.replace(/[ ,]/g,"_");
             nodeColors[term] = color;
             var n =  0;
	     nc.append(
		 '<div class=\"property\" type=\"colour\"><label class=\"style\" for=\"'+term_id+'\">'+
                     '<span class=\"b i\">('+n+')</span> '+term+'</label>'+
		     '<input id=\"'+term_id+'\" type=\"text\" name=\"'+term+'\" value=\"'+color+'\" size=\"7\" ></div>'
	     );
      });

     $(document).find(".property input").each(function(){
       var input = $(this);
       var property = "colour";

       function set_colour(){
           $(input).css({
              backgroundColor: $(input).val()
                 });
		
        }
	    //nodeColors[$(input).attr('id')] = nodeColors[$(input).attr('id')]; //store current color

            $(input).addClass("colour_sample_bg");

            $(input).validate({
                errorMessage: function(str){
                    return "must be a valid " + property;
                },
                valid: function(str){
                    return valid_value( str, property);
                }
            });
            
            set_colour();
            
            // update colour on picker after typing
            $(input).bind("valid", function(){
                if( picker_internals != undefined ){
                    picker_internals.setColor( $(input).val() );
                }
                //set_property( "nodes", $(input).attr("name"), ""+$(input).val(), "fillColor");
                set_node_color($(input).attr("name"),$(input).val());
                set_colour();
            });		
            
	    $(input).bind("invalid", function(){
                $(input).css("background-color", "transparent");
            });
            
            // on empty put # so user doesn't have to
            $(input).bind("keyup", function(){
                if( $(this).val() == "" ){
                    $(this).val("#");
                }
            });
            
            // add clicker near input when clicked
            $(input).bind("click", function(){
                remove_picker();
            
                picker = $('<div id="colour_picker" class="floating_widget">' +
                		   '<div class="header ui-state-default"><div class="ui-icon ui-icon-close"/></div><div class="content"/></div>');
                $("body").append(picker);
                
                if (!$.browser.msie) { $("#colour_picker .header").hide(); }
                
                picker_internals = $.farbtastic($("#colour_picker .content"), function(colour){
                    $(input).val(colour).trigger("validate");
                });

                position_at_input($(picker), $(input));
                
                $(input).trigger("validate");
                
                hide_with_input($(picker), $(input), function(){
                    remove_picker();
                });
            });
        });
 
    $('input:reset').button();
    $('input:reset').click(function() {
			       resetFilters();
    			       reDraw(defLayout, defStyle, convertJSON());
	}); 
			     
    $( "#gene_info_tabs" ).tabs();
  
    $( "#sidebar" ).accordion(
         {
	 autoHeight: false
	 });

    // note: You have to call this once on load even with no data or it acts funny.
    // Could add some kind of "fakenetwork" help button thing.
    vis.ready( function () { cytoscapeReady() });
    vis.draw();

    $(window).load(function() { resetFilters();});

});
