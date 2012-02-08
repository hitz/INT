
/// Requires Jquery and Jquery-ui to be imported

function clickclear(thisfield, defaulttext) {
  if (thisfield.value == defaulttext) {
    thisfield.value = "";
  }
};

$(function() {

    $.get("http://fasolt.stanford.edu/cgi-bin/toolbar.pl",function(res) {
		var header = res;
	        var subhead = header.replace(/=\"\//g,'="http://www.yeastgenome.org/');
	        $('#head_wrapper').html(subhead);
                $('#txt_search').autocomplete({ source: 'http://www.yeastgenome.org/cgi-bin/search/searchSuggest.fpl', 
		                                select: function(event, ui) { 
		                                         $(this).val(ui.item.value);
					                 $('#searchform').submit()
				                      } 
                });

    });

    $.get("http://fasolt.stanford.edu/cgi-bin/footer.pl?no_js=1",function(res) {
		var footer = res;
	        var subfoot = footer.replace(/=\"\//g,'="http://www.yeastgenome.org/');
	        // currently there are no relative links in footer, but hey, you never know
	        // should maybe have a way of stripping out <scripts> as well.
	        $('#foot_wrapper').html(subfoot);
    });
});

