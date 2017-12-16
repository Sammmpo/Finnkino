var arrayOfShows = []; //set up an array for storing show objects.
var arrayOfFutureShows = []; //set up an array for storing show objects that are in the future.
var areaID; //user's selection in dropdown menu.
var searchInput; //user input for search field.
var timeInput; //the date the user is searching for.

var date = new Date();
var currentHours = date.getHours();
var currentMinutes = date.getMinutes();
var currentTime = currentHours+""+currentMinutes;
console.log("Current Time is: "+currentTime);

function show(id, title, theatre, showStart, image) { //constructor for show object.
	this.setProperty("id", id, 0);
	this.setProperty("title", title, "Elokuvan nimi ei saatavilla");
	this.setProperty("theatre", theatre, "Teatterin nimi ei saatavilla");
	this.setProperty("showStart", showStart, "Alkamisaika ei saatavilla");
	this.setProperty("image", image, "img/noImage.jpg");
}
show.prototype.setProperty = function setProperty(key, value, defaultValue){ //added function to the constructor.
	if (value !== undefined){ //undefined means that the tag is missing in Finnkino XML.
		this[key] = value;
	} else {
		this[key] = defaultValue;
		console.log("Missing XML tag in Finnkino API, used default value instead.");
	}
}

// Add all dropdown options to the area selection.
var apiTheatreAreas = new XMLHttpRequest();
apiTheatreAreas.open("GET","https://www.finnkino.fi/xml/TheatreAreas/",true);
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

var apiScheduleDates = new XMLHttpRequest();
apiScheduleDates.open("GET","https://www.finnkino.fi/xml/ScheduleDates/",true);
apiScheduleDates.send();
apiScheduleDates.onreadystatechange=function() {
  if (apiScheduleDates.readyState==4 && apiScheduleDates.status==200){
	var xmlDoc = apiScheduleDates.responseXML; 
	
	var arrayOfTimes = xmlDoc.getElementsByTagName("dateTime");
	var nodeSelectTime = document.getElementById("time");
		
	for (let i = 0; i < arrayOfTimes.length; i++){
		var nodeOptionTime = document.createElement("option");
		console.log(arrayOfTimes[i].firstChild.data.substring(0,10));
		var year = arrayOfTimes[i].firstChild.data.substring(0,4);
		var month = arrayOfTimes[i].firstChild.data.substring(7,5);
		var day = arrayOfTimes[i].firstChild.data.substring(10,8);
		var convertedDate = day+"."+month+"."+year;
		nodeOptionTime.value = convertedDate;
		var nodeText = document.createTextNode(convertedDate);
		nodeSelectTime.appendChild(nodeOptionTime);
		nodeOptionTime.appendChild(nodeText);
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

// Convert XML to JSON.
function xmlToJson(xml) {
	// Create the return object
	var obj = {};
	if (xml.nodeType == 1) { // element
		// do attributes
		if (xml.attributes.length > 0) {
		obj["@attributes"] = {};
			for (var j = 0; j < xml.attributes.length; j++) {
				var attribute = xml.attributes.item(j);
				obj["@attributes"][attribute.nodeName] = attribute.nodeValue;
			}
		}
	} else if (xml.nodeType == 3) { // text
		obj = xml.nodeValue;
	}
	// do children
	if (xml.hasChildNodes()) {
		for(var i = 0; i < xml.childNodes.length; i++) {
			var item = xml.childNodes.item(i);
			var nodeName = item.nodeName;
			if (typeof(obj[nodeName]) == "undefined") {
				obj[nodeName] = xmlToJson(item);
			} else {
				if (typeof(obj[nodeName].push) == "undefined") {
					var old = obj[nodeName];
					obj[nodeName] = [];
					obj[nodeName].push(old);
				}
				obj[nodeName].push(xmlToJson(item));
			}
		}
	}
	return obj;
};

function disableInputToggle(asd){
	if (asd == "enable"){
		document.getElementById("searchField").disabled = false;
		document.getElementById("area").disabled = false;
		//document.getElementById("checkbox").disabled = false;
		document.getElementById("time").disabled = false;
	}
	if (asd == "disable"){
		document.getElementById("searchField").disabled = true;
		document.getElementById("area").disabled = true;
		//document.getElementById("checkbox").disabled = true;
		document.getElementById("time").disabled = true;
	}
}

fillTable(); //autorun on launch.
function fillTable(){ //display table.
	// Disable input fields while fades fx is still rolling to avoid errors.
	disableInputToggle("disable");
	document.getElementById("searchField").value = ""; // Reset search when changing area.
	search(); // rerun search, basically resets search.
	arrayOfShows = []; // reset.
	arrayOfFutureShows = []; // reset.
	console.log("User input: "+document.getElementById("area").value);
	areaID = document.getElementById("area").value;
	timeInput = document.getElementById("time").value;
	var apiSchedule = new XMLHttpRequest();
	apiSchedule.open("GET","https://www.finnkino.fi/xml/Schedule/?area="+areaID+"&dt="+timeInput,true);
	apiSchedule.send();
	apiSchedule.onreadystatechange=function() {
		if (apiSchedule.readyState==4 && apiSchedule.status==200){
		var xmlDoc = apiSchedule.responseXML;
		var jsonObj = xmlToJson(xmlDoc);
		console.log("This is JSON Object:");
		console.log(jsonObj);
		if (jsonObj.Schedule.Shows.Show.length == null){
			jsonObj.Schedule.Shows.Show.length = 0;
		}

		for (let i = 0; i < jsonObj.Schedule.Shows.Show.length; i++){
			var newShow = new show( //create show object.
				jsonObj.Schedule.Shows.Show[i].ID["#text"],
				jsonObj.Schedule.Shows.Show[i].Title["#text"],
				jsonObj.Schedule.Shows.Show[i].Theatre["#text"],
				jsonObj.Schedule.Shows.Show[i].dttmShowStart["#text"],
				jsonObj.Schedule.Shows.Show[i].Images.EventLargeImagePortrait["#text"]
			);
			arrayOfShows.push(newShow); //add show object to array.
		}
		console.log("Shows happening today:");
		console.log(arrayOfShows);

		// Add tablehead to the table.
		var nodeTable = document.getElementById("shows");
		var nodeTableBody = document.getElementById("tableBody"); 
		nodeTableBody.innerHTML = "";
		var arrayOfFutureShows = []; //Shows that are in the future.
		for (let i = 0; i < arrayOfShows.length; i++){
			var convertedHours = arrayOfShows[i].showStart.substring(arrayOfShows[i].showStart.indexOf("T")+1,arrayOfShows[i].showStart.indexOf("T")+3);
			var convertedMinutes = arrayOfShows[i].showStart.substring(arrayOfShows[i].showStart.indexOf("T")+4,arrayOfShows[i].showStart.indexOf("T")+6);
			var convertedStartTime = convertedHours+""+convertedMinutes;
			if (convertedStartTime > currentTime){
				arrayOfFutureShows.push(arrayOfShows[i]);
			}
		}
		console.log("Shows happening later today:");
		console.log(arrayOfFutureShows);

		/*var checkbox = document.getElementById("checkbox");
		if (checkbox.checked == true){
			arrayOfShows = arrayOfFutureShows;
		}*/

		for (let i = 0; i < arrayOfShows.length; i++){ //construct rows for the table.
			
			var nodeTr = document.createElement("tr");
			nodeTr.id = "tr"+i;
			nodeTr.classList.add("tt");
			nodeTr.colspan = 1;
			nodeTableBody.appendChild(nodeTr);

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

			var nodeSpan = document.createElement("span");
			nodeSpan.id = "span"+i;
			nodeSpan.classList.add("tooltip-span");
			document.getElementById("tr"+i).appendChild(nodeSpan);

			var nodeImg = document.createElement("img");
			nodeImg.src = arrayOfShows[i].image;
			document.getElementById("span"+i).appendChild(nodeImg);

			var nodeA = document.createElement("a"); //We need text inside own tag for search function.
			nodeA.id = "a"+i;
			document.getElementById("td1"+i).appendChild(nodeA);
		}
		var tooltipSpan = document.getElementsByClassName('tooltip-span');
		window.onmousemove = function (e) {
			var x = e.clientX,
				y = e.clientY;
			for (let i = 0; i < tooltipSpan.length; i++){
				tooltipSpan[i].style.top = (y + 20) + 'px';
				tooltipSpan[i].style.left = (x + 20) + 'px';
			}
		};


		for (let i = 0; i < arrayOfShows.length; i++){ //This adds content to the table rows.

			var nodeTdText = document.createTextNode(arrayOfShows[i].title);
			document.getElementById("a"+i).appendChild(nodeTdText);

			var nodeTdText = document.createTextNode(arrayOfShows[i].theatre);
			document.getElementById("td2"+i).appendChild(nodeTdText);

			// Read only hours from date and add it to the table row.
			var nodeTdText = document.createTextNode(arrayOfShows[i].showStart.substring(arrayOfShows[i].showStart.indexOf("T")+1,arrayOfShows[i].showStart.length-3));
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
		for (let i = 0; i < arrayOfShows.length; i++){
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
			disableInputToggle("enable");
		}, arrayOfShows.length * 25);


		}	
		
	}

}


