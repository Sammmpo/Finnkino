var arrayOfShows = []; //This is quite useless because there are showIDs-array.
var areaID; //user's selection in dropdown menu.
var searchInput; //user input for search field.

function show(id, title, theatre, showStart, image) {
	this.id = id; //int
	this.title = title; //string
	this.theatre = theatre; //int
	this.showStart = showStart; //string
	this.image = image; //string(url)
}

// Add all dropdown options to the area selection.
var apiTheatreAreas = new XMLHttpRequest();
apiTheatreAreas.open("GET","http://www.finnkino.fi/xml/TheatreAreas/",true);
apiTheatreAreas.send();
apiTheatreAreas.onreadystatechange=function() {
  if (apiTheatreAreas.readyState==4 && apiTheatreAreas.status==200){
	var xmlDoc = apiTheatreAreas.responseXML; 
	
	var areaIDs = xmlDoc.getElementsByTagName("ID");
	var theatreNames = xmlDoc.getElementsByTagName("Name");
	var nodeSelect = document.getElementById("area");
		
	for (let i = 0; i < theatreNames.length; i++){
		var nodeOption = document.createElement("option");
		nodeOption.value = areaIDs[i].firstChild.data;
		var nodeText = document.createTextNode(theatreNames[i].firstChild.data);
		nodeSelect.appendChild(nodeOption);
		nodeOption.appendChild(nodeText);
	}
	
  }
}

function search() {
    var input, filter, table, row, a; //setting up variables.
    searchInput = document.getElementById("searchField").value; //reads input from HTML.
    filter = searchInput.toUpperCase(); //removes case-sensitivy.
	table = document.getElementById("shows");
	rows = table.getElementsByTagName("tr");
	for (let i = 1; i < rows.length; i++) { // Skip 0 because that's tableheading.
		a = table.getElementsByTagName("a")[i-1].innerHTML; //Variable A is a simple string of movie's name. -1 to sync with A-tags, because tableheading doesn't contain A-tag.
        if (a.toUpperCase().indexOf(filter) > -1) {
            rows[i].style.display = ""; //If there are matching characters, display the row.
        } else {
            rows[i].style.display = "none"; //If something in the search doesn't match, hide the row.
		}
    }
}

go(); //autorun on launch.
function go(){ //display table.
	document.getElementById("searchField").disabled = true; // Disable searching while fades fx is still rolling to avoid bugs.
	document.getElementById("searchField").value = ""; // Reset search when changing area.
	search(); // rerun search, basically resets search.
	arrayOfShows = []; // reset arrayOfShows.
	console.log(document.getElementById("area").value);
	areaID = document.getElementById("area").value;
	var apiSchedule = new XMLHttpRequest();
	apiSchedule.open("GET","http://www.finnkino.fi/xml/Schedule/?area="+areaID,true);
	apiSchedule.send();
	apiSchedule.onreadystatechange=function() {
		if (apiSchedule.readyState==4 && apiSchedule.status==200){
		var xmlDoc = apiSchedule.responseXML;
		
		// Create arrays for different show information.
		var showIDs = xmlDoc.getElementsByTagName("ID");
		var showTitles = xmlDoc.getElementsByTagName("Title");
		var showTheatre = xmlDoc.getElementsByTagName("Theatre");
		var showShowStarts = xmlDoc.getElementsByTagName("dttmShowStart");
		var showImages = xmlDoc.getElementsByTagName("EventLargeImagePortrait");

		// Add tablehead to the table.
		var nodeTable = document.getElementById("shows");
		nodeTable.innerHTML = "<thead><tr><th colspan='3'>Näytökset</th></tr></thead>";

		for (let i = 0; i < showIDs.length; i++){ //construct rows for the table.
			
			var nodeTr = document.createElement("tr");
			nodeTr.id = "tr"+i;
			nodeTr.onclick = function(){ bounce(this.id); } //Add bounce fx when clicking table rows.
			nodeTr.classList.add("tt");
			nodeTable.appendChild(nodeTr);

			var nodeTd = document.createElement("td");
			nodeTd.id = "td1"+i;
			nodeTd.classList.add("data1");
			document.getElementById("tr"+i).appendChild(nodeTd);

			var nodeTd = document.createElement("td");
			nodeTd.id = "td2"+i;
			nodeTd.classList.add("data2");
			document.getElementById("tr"+i).appendChild(nodeTd);

			var nodeTd = document.createElement("td");
			nodeTd.id = "td3"+i;
			nodeTd.classList.add("data3");
			document.getElementById("tr"+i).appendChild(nodeTd);

			var nodeImg = document.createElement("img");
			nodeImg.classList.add("ttt");
			nodeImg.src = showImages[i].innerHTML;
			document.getElementById("td1"+i).appendChild(nodeImg);

			var nodeA = document.createElement("a"); //We need text inside own tag for search function.
			nodeA.id = "a"+i;
			document.getElementById("td1"+i).appendChild(nodeA);
		}

		for (let i = 0; i < showIDs.length; i++){ //This adds content to the table rows.
			// the following line goes wrong if Finnkino XML has missing image tags.
			var newShow = new show(showIDs[i].innerHTML, showTitles[i].innerHTML, showTheatre[i].innerHTML, showShowStarts[i].innerHTML, showImages[i].innerHTML);
			console.log(newShow); // print each show to the console.
			arrayOfShows.push(newShow);

			var nodeTdText = document.createTextNode(showTitles[i].innerHTML);
			document.getElementById("a"+i).appendChild(nodeTdText);

			var nodeTdText = document.createTextNode(showTheatre[i].innerHTML);
			document.getElementById("td2"+i).appendChild(nodeTdText);

			//Alternative: Display both day and hours with ", " separator.
			//var day = showShowStarts[i].innerHTML.substring(0, showShowStarts[i].innerHTML.indexOf("T"));
			//var hours = showShowStarts[i].innerHTML.substring(showShowStarts[i].innerHTML.indexOf("T")+1, showShowStarts[i].innerHTML.length);
			//var nodeTdText = document.createTextNode(day+", "+hours);

			// Read only hours from date and add it to the table row.
			var nodeTdText = document.createTextNode(showShowStarts[i].innerHTML.substring(showShowStarts[i].innerHTML.indexOf("T")+1,showShowStarts[i].innerHTML.length));
			document.getElementById("td3"+i).appendChild(nodeTdText);

			
			//Instantly fade out all rows so that they can be faded in one by one.
			$(document).ready(function() {
				$("#tr"+i).fadeOut( 0, function(){ 
					$(".log").text('Fade Out done');
				 });	
			});
			
		}

		// Fade in all rows one by one.
		var counter = 0;
		for (let i = 0; i < showIDs.length; i++){
			counter += 1;
			myTimeout = setTimeout(function() {
				$(document).ready(function() {	
					$("#tr"+i).fadeIn( 'slow', function(){ 
						$(".log").text('Fade In done');
					 });
				});
			}, counter * 25); // time between each fade, we want this to be fast.
		}

		// Allows searching after fades are done.
		var canSearch = setTimeout(function() {
			document.getElementById("searchField").disabled = false;
		}, showIDs.length * 25);

		console.log(arrayOfShows);


		}	
	}

}

//Unnecessary bounce effect to test jQuery.
function bounce(id){
		$(document).ready(function() {	
			$( "#"+id ).effect( "bounce", {times:3}, 300 );
		});
}


