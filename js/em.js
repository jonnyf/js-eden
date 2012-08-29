var selected_observable = null;
var selected_function = null;

function printObservables(pattern) {
	return;
	obspos = 0;

	$('#observable-results').html('');
	var reg = new RegExp("^"+pattern+".*");
	var myeditor;
	$.each(root.symbols, function(name,symbol) { 
		if (name.search(reg) == -1) { return; }
		if (symbol.definition !== undefined) {
			if (symbol.eden_definition !== undefined) {
				var subs = symbol.eden_definition.substring(0,4);
				if (subs == "proc") {
					add_procedure(symbol, name);
					//return;
				} else if (subs == "func") {
					add_function(symbol, name);
					//return;
				} else {
					add_observable(symbol,name);
				}
			} else {
				add_observable(symbol,name);
			}
		} else {
			add_observable(symbol, name);
		}
	});


	if ($('#observable-results')[0].offsetHeight > (14*16)) {
		$('#observable-scrollup').show();
		$('#observable-scrolldown').show();
	} else {
		$('#observable-scrollup').hide();
		$('#observable-scrolldown').hide();
	}
}


var selected_project = null;



function printAllUpdates() {
	return;
	printObservables($('#observable-search')[0].value);
}

var $dialog;
var root;
var eden;
var stored_script;
var obspos = 0;
var procspos = 0;
var funcspos = 0;
var projects;
var edenfunctions = {};
var side_bar_height = 300;
var input_dialog;
var current_view = new Array();


function js_eden_init() {

	//Get a list of projects
	$.ajax({
		url: "models/projects.json",
		success: function(data) {
			//projects = JSON.parse(data);
			projects = data;
			printCollections("");
		},
		cache: false,
		async: true
	});

	//Get a list of sessions
	get_collections();

	//Initialise Sessions
	session_init();

	$(window).resize(function() {
		$("#d1canvas").attr("width", $("#eden-content").width()-40);
		$("#d1canvas").attr("height", $("#tabs").height()-80);
		side_bar_height = $(window).height() - 35 - 200;
		$(".results-lim").css("max-height",""+ (side_bar_height-76)+"px");

	});

	$(document).ready(function() {
		//runTests(all_the_tests);
		root = new Folder();
		eden = new Eden(root);

		//Make sure canvas and side-bar are the correct height.
		$("#d1canvas").attr("width", $("#eden-content").width()-40);
		$("#d1canvas").attr("height", $("#tabs").height()-80);
		side_bar_height = $(window).height() - 35 - 200;
		$(".results-lim").css("max-height",""+ (side_bar_height-76)+"px");

		modelbase = "";

		//Button to hide side bar.
		$("#hide-side").click(function() {
			if ($(this).css("top") == "115px") {
				$("#side-bar").animate({width: "0px"},100);
				$("#tabs").animate({left: "0px"},100);
				$(this).css("top", "80px");
				$("#d1canvas").attr("width", $("#eden-content").width()-40);
			} else {
				$("#side-bar").animate({width: "250px"},100);
				$("#tabs").animate({left: "250px"},100);
				$(this).css("top", "115px");
				$("#d1canvas").attr("width", $("#eden-content").width()-40);
			}
		}).hover(function() {
			if ($(this).css("top") == "115px") {
				$(this).css("backgroundImage", "url('images/hide-hor-icon-sel.png')");
			} else {
				$(this).css("backgroundImage", "url('images/show-hor-icon-sel.png')");
			}
		}, function() {
			if ($(this).css("top") == "115px") {
				$(this).css("backgroundImage", "url('images/hide-hor-icon.png')");
			} else {
				$(this).css("backgroundImage", "url('images/show-hor-icon.png')");
			}
		});

		//Button to hide top bar.
		$("#hide-top").click(function() {
			if ($(this).css("top") == "80px") {
				$("#title-bar").animate({height: "0px"},100);
				$("#tabs").animate({top: "25px"},100);
				$(this).css("top", "0px");
				$("#d1canvas").attr("height", $("#tabs").height()-80);
			} else {
				$("#title-bar").animate({height: "80px"},100);
				$("#tabs").animate({top: "105px"},100);
				$(this).css("top", "80px");
				$("#d1canvas").attr("height", $("#tabs").height()-80);
			}
		}).hover(function() {
			if ($(this).css("top") == "80px") {
				$(this).css("backgroundImage", "url('images/hide-ver-icon-sel.png')");
			} else {
				$(this).css("backgroundImage", "url('images/show-ver-icon-sel.png')");
			}
		}, function() {
			if ($(this).css("top") == "80px") {
				$(this).css("backgroundImage", "url('images/hide-ver-icon.png')");
			} else {
				$(this).css("backgroundImage", "url('images/show-ver-icon.png')");
			}
		});

		//Button to display the input window.
		$("#show-input").click(function() {
			input_dialog.dialog("open");
		}).hover(function() {
			$(this).css("backgroundImage", "url('images/input-icon-sel.png')");
		}, function() {
			$(this).css("backgroundImage", "url('images/input-icon.png')");
		});

		$("#tabs").tabs();

		$("#observable-info").hide();

		//Get the current JS-Eden version number
		$.ajax({
			url: "version.rhtml",
			success: function(data) {
				$('#version-number').html("js-eden "+data);
			},
			cache: false,
			async: true
		});

		//Obtain function meta data from server
		$.ajax({
			url: "library/functions.json",
			success: function(data) {
				//edenfunctions = JSON.parse(data);
				edenfunctions = data;
				printObservables("");
				window.viewer.setDocs(edenfunctions);
			},
			cache: false,
			async: true
		});

		$(".side-bar-topic-title").hover(function() {
			$(this).animate({backgroundColor: "#ab0000"}, 100);
		}, function() {
			$(this).animate({backgroundColor: "#3f3f3f"}, 100);
		});

		$(".side-bar-topic").each(function() {
			var me = $(this).find(".side-bar-topic-content");
			if (me.height() != 0) {
				me.height(side_bar_height);
			}

			$(this).find(".side-bar-topic-title").click( function() {
				me.animate({height: ""+side_bar_height+"px"}, 100);
				$(".side-bar-topic-content").each(function() {
					if (this != me[0]) {
						$(this).animate({height: "0px"}, 100);
					}
				});
			});
		});

		//$("#observable-results").hover(null,function() {
		//	$("#observable-info").hide();
		//});

		$('#observable-scrollup').click(function() {
			obspos = obspos + (14*16);
			if (obspos > 0) { obspos = 0; }
			$('#observable-results > div').animate({top: ""+obspos+"px"},300);
		}).hover(function() {
			$(this).animate({backgroundColor: "#fafafa"}, 100);
			$(this).css("backgroundImage", "url('images/scrollup-sel.png')");
		}, function() {
			$(this).animate({backgroundColor: "white"}, 100);
			$(this).css("backgroundImage", "url('images/scrollup.png')");
		});

		$('#observable-scrolldown').click(function() {
			obspos = obspos - (14*16);
			if (obspos <= 0 - ($('#observable-results')[0].offsetHeight)) { obspos = obspos + (14*16); }
			$('#observable-results > div').animate({top: ""+obspos+"px"},300);
		}).hover(function() {
			$(this).animate({backgroundColor: "#fafafa"}, 100);
			$(this).css("backgroundImage", "url('images/scrolldown-sel.png')");
		}, function() {
			$(this).animate({backgroundColor: "white"}, 100);
			$(this).css("backgroundImage", "url('images/scrolldown.png')");
		});

		$("#observable-search").keyup(function() {
			printObservables(this.value);
		});
		printObservables("");

		

		$("#project-search").keyup(function() {
			printCollections(this.value);
		});

		root.addGlobal(function (sym, create) {
			return;
			//console.log("Obs changed: " + sym.name.substr(1));

			//if (root.autocalc_state == true) {
				session_changes[sym.name.substr(1)] = true;
			//}


			if (create) {
				printObservables($('#observable-search')[0].value);
				return;
			}

			var me = $("#sbobs_"+sym.name.substr(1));
			if (me === undefined) { return; }
			
			var namehtml;
			if (sym.definition !== undefined) {
				namehtml = "<span class=\"hasdef_text\">"+sym.name.substr(1)+"</span>";
			} else {
				namehtml = sym.name.substr(1);
			}

			var val = sym.value();
			var valhtml;
			if (typeof val == "boolean") { valhtml = "<span class='special_text'>"+val+"</span>"; }
			else if (typeof val == "undefined") { valhtml = "<span class='error_text'>undefined</span>"; }
			else if (typeof val == "string") { valhtml = "<span class='string_text'>\""+val+"\"</span>"; }
			else if (typeof val == "number") { valhtml = "<span class='numeric_text'>"+val+"</span>"; }
			else { valhtml = val; }


			me.html("<li class=\"type-observable\">" + namehtml + "<span class='result_value'> = " + valhtml + "</span></li>");
		});

		make_interpreter("eden","EDEN Interpreter Window");

		$('<pre id="error-window" style="font-family:monospace;"></pre>').appendTo($('body'));

		Eden.executeFile("library/eden.jse");
	});
}
