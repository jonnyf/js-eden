function add_procedure(symbol, name) {
	var proc = $('<div class="result-element"></div>');
	proc.html("<li class=\"type-procedure\"><span class=\"result_name\">" + name + "</span></li>").appendTo($('#procedure-results'));

	proc.get(0).symbol = symbol;

	proc.hover(
		function() {
			$(this).animate({backgroundColor: "#eaeaea"}, 100);
		}, function() {
			$(this).animate({backgroundColor: "white"}, 100);
		}	
		).click(function() {
		
		this.dialog = procedure_dialog(this.symbol, this.dialog);
	});
};

function add_function(symbol, name) {
	var funchtml = "<li class=\"type-function\"><span class=\"result_name\">" + name + "</span>";
	var details;
	if (edenfunctions.functions != undefined && edenfunctions.functions[name] !== undefined) {
		details = edenfunctions.functions[name];
		funchtml = funchtml + "<span class='result_value'> ( ";
		if (edenfunctions.functions[name].parameters !== undefined) {
			for (x in edenfunctions.functions[name].parameters) {
				funchtml = funchtml + x + ", ";
			}
			funchtml = funchtml.substr(0,funchtml.length-2) + " )</span>";
		} else {
			funchtml = funchtml + " )</span>";
		}
	}
	funchtml = funchtml + "</li>";
	var resel = $('<div class="result-element"></div>');
	
	// Bit of a hack, need to check if the function actually has a draw() method instead of just checking that the function starts with a capital letter
	(/^[A-Z]/.test(name)) ? resel.html(funchtml).appendTo($('#drawable-results')) : resel.html(funchtml).appendTo($('#functions-results'));
//	resel.html(funchtml).appendTo($('#function-results'));
	resel.get(0).details = details;
	resel.get(0).symbol = symbol;

	resel.hover(
		function() {
			if (this != selected_function) {
				$(this).animate({backgroundColor: "#eaeaea"}, 100);
			}

			var info = $('#functions-info');

			if (this.details !== undefined) {
				var iname = info.find('#functions-info-name');
				iname.text(this.details.description);
				info.css("left", "" + (this.offsetLeft + this.offsetWidth) + "px");
				info.css("top", "" + (this.offsetTop + 125 - 8 - 16 - ((info[0].offsetHeight / 2))) + "px");
				info.show();
			} else {
				info.hide();
			}
		}, function() {
			$('#functions-info').hide();
			if (this != selected_function) {
				$(this).animate({backgroundColor: "white"}, 100);
			}
		}	
		).click(function() {
		if (selected_function != null) {
			$(selected_function).animate({backgroundColor: "white"}, 100);
		}
		selected_function = this;
		$(this).animate({backgroundColor: "#ffebc9"}, 100);

		this.dialog = function_dialog(this.symbol, this.dialog);
	});
};

function add_observable(symbol, name) {
	var val = symbol.value();
	var valhtml;
	if (typeof val == "boolean") { valhtml = "<span class='special_text'>"+val+"</span>"; }
	else if (typeof val == "undefined") { valhtml = "<span class='error_text'>undefined</span>"; }
	else if (typeof val == "string") { valhtml = "<span class='string_text'>\""+val+"\"</span>"; }
	else if (typeof val == "number") { valhtml = "<span class='numeric_text'>"+val+"</span>"; }
	else { valhtml = val; }

	var namehtml;
	if (symbol.definition !== undefined) {
		namehtml = "<span class=\"hasdef_text\">"+name+"</span>";
	} else {
		namehtml = name;
	}

	var ele = $('<div id="sbobs_' + name + '" class="result-element"></div>');
	ele.html("<li class=\"type-observable\"><span class=\"result_name\">" + namehtml + "</span><span class='result_value'> = " + valhtml + "</span></li>").appendTo($('#observable-results'));
	ele.get(0).symbol = symbol;

	ele.hover(
		function() {
			if (this != selected_observable) {
				$(this).animate({backgroundColor: "#eaeaea"}, 100);
			}
			var info = $('#observable-info');

			if (this.symbol.definition !== undefined) {
				var iname = info.find('#observable-info-name');
				iname.text(this.symbol.eden_definition);
				info.css("left", "" + (this.offsetLeft + this.offsetWidth) + "px");
				info.css("top", "" + (this.offsetTop + 125 - 8 - ((info[0].offsetHeight / 2))) + "px");
				info.show();
			} else {
				info.hide();
			}
		}, function() {
			$('#observable-info').hide();
			if (this != selected_observable) {
				$(this).animate({backgroundColor: "white"}, 100);
			}
		}	
	).click(function() {
		if (selected_observable != null) {
			$(selected_observable).animate({backgroundColor: "white"}, 100);
		}
		selected_observable = this;
		$(this).animate({backgroundColor: "#ffebc9"}, 100);

		this.dialog = observable_dialog(this.symbol, this.dialog);
	});
};

function observable_dialog(symbol,existing) {
	var myeditor;

	$code_html = '<div class="obs_stats">Current Value: ' + symbol.value() + '</div><div id="obs_inspector_' + symbol.name.substr(1) + '" class="obs_inspector"><div></div><pre class="eden exec">';
	if (symbol.definition === undefined || symbol.eden_definition === "") {
		$code_html = $code_html + symbol.name.substr(1) + " = " + symbol.value() + ';';
	} else {
		$code_html = $code_html + symbol.eden_definition + ';';
	}
	$code_html = $code_html + "</pre></div>";

	if (existing === undefined) {
		$dialog = $('<div></div>');
		$dialog.html($code_html);
		$dialog.dialog({
			title: 'Observable: ' + symbol.name.substr(1),
			width: 350,
			height: 150,
			minWidth: 250,
			minHeight: 150,
			buttons: {
				Save: function() {
					try {
						eden.addHistory(myeditor.getValue());
						$('#history-content').append('<div id="history-'+eden.history.length+'"></div><hr />');
						$('#history-'+eden.history.length).text(myeditor.getValue());
						eval(Eden.translateToJavaScript(myeditor.getValue()));
					} catch (e) {
                        var contents = $('#history-'+eden.history.length).html();
                        $('#history-'+eden.history.length).attr('class','history-error').html('## '+contents);
						Eden.reportError(e);
					}
				}
			}
		});
		myeditor = convertToEdenPageNew('#obs_inspector_'+symbol.name.substr(1),'defedit');
		$dialog.get(0).editor = myeditor;
		return $dialog;
	} else {
		$code_html = "";
		if (symbol.definition === undefined || symbol.eden_definition === "") {
			$code_html = $code_html + symbol.name.substr(1) + " = " + symbol.value() + ';';
		} else {
			$code_html = $code_html + symbol.eden_definition + ';';
		}

		existing.dialog("open");
		existing.get(0).editor.setValue($code_html);
		return existing;
	}

	
}

function function_dialog(symbol, existing) {
	var myeditor;

	$code_html = '<div id="obs_inspector_' + symbol.name.substr(1) + '" class="obs_inspector"><div></div><pre class="eden exec">';
	if (symbol.definition === undefined) {
		$code_html = $code_html + symbol.name.substr(1) + " = " + symbol.value() + ';';
	} else {
		$code_html = $code_html + symbol.eden_definition + ';';
	}
	$code_html = $code_html + "</pre></div>";

	if (existing === undefined) {
		$dialog = $('<div></div>');
		$dialog.html($code_html);
		$dialog.dialog({
			title: 'Function: ' + symbol.name.substr(1),
			width: 350,
			height: 250,
			minWidth: 250,
			minHeight: 150,
			buttons: {
					Save: function () {
						try {
							eden.addHistory(myeditor.getValue());
							eval(Eden.translateToJavaScript(myeditor.getValue()));
						} catch (e) {
							Eden.reportError(e);
						}
					}
				}
		});
		myeditor = convertToEdenPageNew('#obs_inspector_'+symbol.name.substr(1),'defedit');
		$dialog.get(0).editor = myeditor;
		return $dialog;
	} else {
		$code_html = "";
		if (symbol.definition === undefined) {
			$code_html = $code_html + symbol.name.substr(1) + " = " + symbol.value() + ';';
		} else {
			$code_html = $code_html + symbol.eden_definition + ';';
		}

		existing.dialog("open");
		existing.get(0).editor.setValue($code_html);
		return existing;
	}
}

function procedure_dialog(symbol, existing) {
	var myeditor;

	$code_html = '<div id="obs_inspector_' + symbol.name.substr(1) + '" class="obs_inspector"><div></div><pre class="eden exec">';
	if (symbol.definition === undefined) {
		$code_html = $code_html + symbol.name.substr(1) + " = " + symbol.value() + ';';
	} else {
		$code_html = $code_html + symbol.eden_definition + ';';
	}
	$code_html = $code_html + "</pre></div>";

	if (existing === undefined) {
		$dialog = $('<div></div>');
		$dialog.html($code_html);
		$dialog.dialog({
			title: 'Procedure: ' + symbol.name.substr(1),
			width: 350,
			height: 250,
			minWidth: 250,
			minHeight: 150,
			buttons: {
					Save: function() {
						try {
							eden.addHistory(myeditor.getValue());
							eval(Eden.translateToJavaScript(myeditor.getValue()));
						} catch (e) {
							Eden.reportError(e);
						}
					}
				}
		});
		myeditor = convertToEdenPageNew('#obs_inspector_'+symbol.name.substr(1),'defedit');
		$dialog.get(0).editor = myeditor;
		return $dialog;
	} else {
		$code_html = "";
		if (symbol.definition === undefined) {
			$code_html = $code_html + symbol.name.substr(1) + " = " + symbol.value() + ';';
		} else {
			$code_html = $code_html + symbol.eden_definition + ';';
		}

		existing.dialog("open");
		existing.get(0).editor.setValue($code_html);
		return existing;
	}
};
