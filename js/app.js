/*// Check for the various File API support.
if (window.File && window.FileReader && window.FileList && window.Blob) {
  // Great success! All the File APIs are supported.
} else {
  alert('The File APIs are not fully supported in this browser.');
}*/

// global sound stuff
var mySound;
var buttonsHTML;
var selection;
var selections = [];
var selected;
var loopFile;
var speed = 1;
var currentFile = ""; 
var playing = false;
var timer;
var standard = true;
var stdTrackUrl = "https://soundcloud.com/overgood/esquina-latina-oye-como-va";
var options =  {preferFlash: false, useHTML5Audio: true};

head.js("js/jquery-1.9.1.js", "js/sdk.js", "js/jquery-ui-1.10.1.custom.js",  function() {	
	SC.initialize({
		preferFlash: false,
		useHTML5Audio: true,
		client_id: "c5b33817e01cd515b9557e975888cae4",
		redirect_uri: "https://dl.dropboxusercontent.com/u/5100494/SC-SlowDowner/callback.html",
	});
	
	openUrl(getInitialTrack());
	buttonsHTML = $('#buttons').html();
	
});

// init functions
function init() {
	initSpeedSlider('#speed');
	initProgressSlider('#progress');
	initSelectionSlider('#selection');
	initAddSelectionButtons();
	initDialogs();
	initSelections();
	initSelectionButtons('#selectionButtons', 0);
	//initLoadingBar('#loading');
	initButtons('#buttons');
	setSpeed(speed);
 }
 
function initSelections() {
	if (standard) {
		selections = [
			{ start: 0, end: 12, name: "Intro" },
			{ start: 11, end: 18, name: "Chorus" },
			{ start: 31, end: 54, name: "Solo Git" },
			{ start: 66, end: 89, name: "Solo Sax" },
			{ start: 96, end: 100, name: "End" }
		];
	} else {
		selections = [
			{ start: 0, end: 12, name: "Start" },
			{ start: 20, end: 70, name: "Mid" },
			{ start: 80, end: 100, name: "End" }
		];
	}
}
   
function storeCurrentSelection() {
	selections[selected].start = selection.slider('values')[0];
	selections[selected].end = selection.slider('values')[1];
}
 
function openUrlDialog() {
	console.log("enter url dialog");
	//$("#dialog-url-form input#url").val("");
	$( "#dialog-url-form" ).dialog( "open" );
} 
 
function editSelectionName() {
	console.log("edit element nr " + selected);
	$("#dialog-form input#description").val(selections[selected].name);
	$( "#dialog-form" ).dialog( "open" );
}

function deleteSelection() {
	console.log("remove element nr " + selected);
	if (selections.length > 1) {
		selections.splice(selected, 1);
		if (selected > (selections.length - 1)) {
			selected = selections.length - 1;
		}
		initSelectionButtons('#selectionButtons', selected);
	}
}
 
function addSelection() {
	console.log("add selection " + selections.length);
	storeCurrentSelection();
	selections.push({ start: 0, end: 53, name: "new!" });
	initSelectionButtons('#selectionButtons', (selections.length - 1));
}
 
function moveSelectionButton(move) {
	storeCurrentSelection();
	var newPosition = selected + move;
	if (newPosition < 0) {
		newPosition = selections.length - 1;
	}
	if (newPosition > (selections.length - 1)) {
		newPosition = 0;
	}
	
	var tmp = selections[selected];
	selections[selected] = selections[newPosition];
	selections[newPosition] = tmp;
	initSelectionButtons('#selectionButtons', newPosition);
}
 
function openUrl(url) {
	console.log("open url: " + url);
		SC.get("/resolve", {url: url}, function(e) { 
			SC.stream(e.uri, options, function(sound){
				mySound = sound;
				init();
				$("#title").html(e.title);
				$("#description").html(e.description);
				$("#waveform img").attr("src", e.waveform_url)
		});
	});
}

var getInitialTrack = function() {
	var track = stdTrackUrl;
	if (location.hash.length>0) {
		track = location.hash.substring(1);
	} 
	if (track == "undefined") {
		track = stdTrackUrl;
	}
	if (track != stdTrackUrl) {
		standard = false;
	}
	return new String(track);
};
 
function initDialogs() {
	$("#dialog-form").dialog({
      autoOpen: false,
      height: 300,
      width: 350,
      modal: true,
	  closeOnEscape: true,
	  closeText: "close",
      buttons: {
        "save": function() {
          console.log("pressed save");
		  selections[selected].name = $(".ui-dialog #description").val();
		  initSelectionButtons('#selectionButtons', selected);
          $( this ).dialog( "close" );
        },
		"delete": function() {
			console.log("pressed delete");
			deleteSelection();
			$( this ).dialog( "close" );
		},
        Cancel: function() {
          $( this ).dialog( "close" );
        }
      },
      close: function() {
        console.log("close");
      }, 
	  closeText: ""
    });
	$("#dialog-form").keypress(function(e) {
		if (e.keyCode == $.ui.keyCode.ENTER) {
			e.preventDefault();
			console.log("pressed enter");
			selections[selected].name = $(".ui-dialog #description").val();
			initSelectionButtons('#selectionButtons', selected);
			$("#dialog-form").dialog( "close" );
		}
	});
	$("#dialog-url-form").dialog({
      autoOpen: false,
      height: 300,
      width: 350,
      modal: true,
	  closeOnEscape: true,
	  closeText: "close",
      buttons: {
        "open": function() {
          console.log("pressed open");
		  var url = $(".ui-dialog #url").val();
		  openUrl(url);
          $( this ).dialog( "close" );
        },
        Cancel: function() {
          $( this ).dialog( "close" );
        }
      },
      close: function() {
        console.log("close");
      }, 
	  closeText: ""
    });
	$("#dialog-url-form").keypress(function(e) {
		if (e.keyCode == $.ui.keyCode.ENTER) {
			e.preventDefault();
			console.log("pressed enter");
			var url = $(".ui-dialog #url").val();
			openUrl(url);
			$("#dialog-url-form").dialog( "close" );
		}
	});
}
 
function initAddSelectionButtons() {
	$("#selections button").off();
	$("#addSelection").button({
		text: false,
		icons: {
			primary: "ui-icon-plus"
		}
	})
		.click(function() {
			addSelection();
		});
	$("#editSelectionName").button({
		text: false,
		icons: {
			primary: "ui-icon-pencil"
		}
	})
		.click(function() {
			editSelectionName();
		});
	$("#moveLeft").button({
		text: false,
		icons: {
			primary: "ui-icon-arrowthick-1-w"
		}
	})
		.click(function() {
			moveSelectionButton(-1);
		});
	$("#moveRight").button({
		text: false,
		icons: {
			primary: "ui-icon-arrowthick-1-e"
		}
	})
		.click(function() {
			moveSelectionButton(1);
		});
}

function initSelectionButtons(id, sel) {
	var i = -1;
	var html = '';
	for (s in selections) {
		html += '<input type="radio" id="radio'+ ++i +'" name="selections" /><label for="radio'+i+'">'+ selections[i].name +'</label>';
	}
	
	$(id).html(html)
	$(id).buttonset();
	selected = sel;
	var rb = $('#radio' + selected);
    rb[0].checked = true;
    rb.button("refresh");
	selection.slider('values', [selections[selected].start, selections[selected].end]);
	
	$(id + " :radio").click(function(e) {	

		$('.partTooltip').remove();
		storeCurrentSelection();
		
		var radio = this.id;
		var newSelected = parseInt(radio.replace("radio", ""));
		
		if (selected == newSelected) {
			console.log("clicked twice");
		}
		
		selected = newSelected;
		
		console.log("element id: " + selected);
		selection.slider('values', [selections[selected].start, selections[selected].end]);
	});

};

function initButtons(id) {
	$('#buttons').html(buttonsHTML);
	$('#bookmarklet').button();
    $( "#rewind" ).button({
		text: false,
		icons: {
			primary: "ui-icon-seek-prev"
		}
	})
		.click(function() {
			mySound.setPosition(selection.slider('values')[0] * mySound.durationEstimate / 100);
		});
	$( "#openUrl" ).button({
		text: false,
		icons: {
			primary: "ui-icon-folder-open"
		}
	}).click(function() {
		console.log("open url");
		openUrlDialog();
	});
    $( "#play" ).button({
		text: false,
		icons: {
			primary: "ui-icon-play"
		}
    })
		.click(function() {
			var options;
			if ( $( this ).text() === "play" ) {
				play();
				console.log("play");
				options = {
					label: "pause",
					icons: {
						primary: "ui-icon-pause"
					}
				};
			} else {
				pause();
				options = {
					label: "play",
					icons: {
						primary: "ui-icon-play"
					}
				};
			}
			$( this ).button( "option", options );
		});
    $( "#stop" ).button({
		text: false,
		icons: {
			primary: "ui-icon-stop"
		}
    })
		.click(function() {
			stop();
		});
    $("#loop").button({
		text: false,
		icons: {
			primary: "ui-icon-refresh"
		}
	})
		.click(function() {
			if ($(this).is(":checked")) {
				loop(true);
			} else {
				loop(false);
			}
		});
	loop(true);
	$('#loop').attr('checked','checked').button("refresh");
}

function initSelectionSlider(id) {
	$(id + ' .tooltip').hide();
    selection = $(id).slider({
		orientation: "horizontal",
		range: true,
		min: 0,
		max: 100,
		step: 0.1,
		values: [0, 100],
		change: function( event, ui ) {
			//console.log("position: " + ui.value);
			//mySound.setPosition(ui.value * mySound.durationEstimate / 100);
			var value = ((ui.value - 0.0) * 500 / 100) - 10;			
			$(id + ' .tooltip').css('left', value).text(ui.value);  
		},
		slide: function( event, ui ) {
			console.log("position: " + ui.value);
			//mySound.setPosition(ui.value * mySound.durationEstimate / 100);
			var value = ((ui.value - 0.0) * 500 / 100) - 10;
			$(id + ' .tooltip').css('left', value).text(ui.value);  
		},
		start: function(event,ui) {
			$(id + ' .tooltip').fadeIn('fast');
		},
		stop: function(event,ui) {
			$(id + ' .tooltip').fadeOut('fast');
		},	
    });
	$("#sortable").sortable();
    $("#sortable").disableSelection();
}

function initProgressSlider(id) {
	$(id + ' .tooltip').hide();

    $(id).slider({
		orientation: "horizontal",
		range: "min",
		min: 0,
		max: 100,
		step: 0.1,
		step: 0.1,
		value: 0,
		change: function( event, ui ) {
			//console.log("position: " + ui.value);	
			//mySound.setPosition(ui.value * mySound.durationEstimate / 100);			
			var value = (($(id).slider('value') - 0.0) * 500 / 100) - 10;
			$(id + ' .tooltip').css('left', value).text(ui.value);  
		},
		slide: function( event, ui ) {
			console.log("position: " + ui.value);
			mySound.setPosition(ui.value * mySound.durationEstimate / 100);			
			var value = (($(id).slider('value') - 0.0) * 500 / 100) - 10;
			$(id + ' .tooltip').css('left', value).text(ui.value);  
		},
		start: function(event,ui) {
			$(id + ' .tooltip').fadeIn('fast');
		},
		stop: function(event,ui) {
			$(id + ' .tooltip').fadeOut('fast');
		},	
    });
}

function initSpeedSlider(id) {
	$(id + ' .tooltip').hide();
	$(id + ' .tooltip').css('left', -10); 
	
    $(id).slider({
		orientation: "vertical",
		range: "min",
		min: 0.5,
		max: 100,
		value: 25,
		step: 0.05,
		change: function( event, ui ) {
			//console.log("position: " + ui.value);
			//mySound.setTime(buzz.fromPercent(ui.value, mySound.getDuration()));			
			var value = 200 - (($(id).slider('value') - 0.0) * 2 / 1)- 40;
			
			var speedValue = (ui.value + 25) / 100 * 2;
			speedValue = Math.round(speedValue * 100) / 100;
			$(id + ' .tooltip').css('top', value).text(speedValue);
		},
		slide: function( event, ui ) {
			var speedValue = (ui.value + 25) / 100 * 2;
			speedValue = Math.round(speedValue * 100) / 100;
			var value = 200 - (($(id).slider('value') - 0.0) * 2 / 1)- 40;
			$(id + ' .tooltip').css('top', value).text(speedValue);  
			setSpeed(speedValue);	
			
		},
		start: function(event,ui) {
			$(id + ' .tooltip').fadeIn('fast');
		},
		stop: function(event,ui) {
			$(id + ' .tooltip').fadeOut('fast');
		},
    });
}

// player functions
var setSpeed = function(speed) {
	console.log("setSpeed: " + speed);
	if (mySound.isHTML5 == true) {
		mySound._a.playbackRate = speed;
	} else {
		console.log("cannot change speed because player is not HTML5!");
	}
}

function play() {
	playing = true;
	mySound.play({whileplaying: function() {
		var currentTime = mySound.position;
		
		//console.log("getTime: " + currentTime + " [1]: " + selection.slider('values')[1] * mySound.durationEstimate / 100);
		
		if (playing) {
			if (loopFile) {
				if (currentTime > (selection.slider('values')[1] * mySound.durationEstimate / 100)) {
				
					console.log("repeat");
					mySound.setPosition(selection.slider('values')[0] * mySound.durationEstimate / 100); //.fadeTo(volume, 1500);
				
				} else if (currentTime < (selection.slider('values')[0] * mySound.durationEstimate / 100)) {
				
					console.log("to the start");
					mySound.setPosition(selection.slider('values')[0] * mySound.durationEstimate / 100); //.fadeTo(volume, 1500);
				
				}
			}
			/*if (mySound.isEnded()) {
				stop();
			}*/
			
			// update progress bar slider
			var percent = mySound.position / mySound.durationEstimate * 100;
			console.log("update slider position: " + percent);
			$("#progress").slider("value", percent);
		}
	}});
}

function stop() {
	playing = false;
	mySound.stop();
	if (loopFile) {
		mySound.setPosition(0);
		mySound.stop();
	}
	$( "#play" ).button( "option", {
		label: "play",
		icons: {
			primary: "ui-icon-play"
		}
	});
}

function pause() {
	playing = false;
	mySound.pause();
}

function loop(loopValue) {
	loopFile = loopValue;
}