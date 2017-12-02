var arrayOfShows = [];

function show(id, title, theatre) {
	this.id = id; //int
	this.title = title; //string
	this.theatre = theatre; //string
	//this.dttmShowStart = dttmShowStart; //string
}

var apiTheatreAreas = new XMLHttpRequest();
apiTheatreAreas.open("GET","http://www.finnkino.fi/xml/TheatreAreas/",true);
apiTheatreAreas.send();
apiTheatreAreas.onreadystatechange=function() {
  if (apiTheatreAreas.readyState==4 && apiTheatreAreas.status==200){
	var xmlDoc = apiTheatreAreas.responseXML; 
	
	var theatre = xmlDoc.getElementsByTagName("ID");
	var theatreNames = xmlDoc.getElementsByTagName("Name");
	nodeSelect = document.getElementById("selection");
	nodeSelect.id = "theatre";
		
	for (let i = 0; i < theatreNames.length; i++){
		var nodeOption = document.createElement("option");
		//nodeOption.value = theatre[i].firstChild.data;
		nodeOption.value = theatreNames[i].firstChild.data
		var nodeText = document.createTextNode(theatreNames[i].firstChild.data);
		nodeSelect.appendChild(nodeOption);
		nodeOption.appendChild(nodeText);
	}
	
  }
}

var apiSchedule = new XMLHttpRequest();
apiSchedule.open("GET","http://www.finnkino.fi/xml/Schedule/",true);
apiSchedule.send();
apiSchedule.onreadystatechange=function() {
  if (apiSchedule.readyState==4 && apiSchedule.status==200){
	var xmlDoc = apiSchedule.responseXML;
	
	var showIDs = xmlDoc.getElementsByTagName("ID");
	//console.log(showIDs);
	var showTitles = xmlDoc.getElementsByTagName("Title");
	//console.log(showTitles);
	var showTheatre = xmlDoc.getElementsByTagName("Theatre");
	//console.log(showTheatreIds);

	for (let i = 0; i < showIDs.length; i++){
		var newShow = new show(showIDs[i].innerHTML, showTitles[i].innerHTML, showTheatre[i].innerHTML);
		console.log(newShow); // print each show to the console.
		arrayOfShows.push(newShow);
	}
	console.log(arrayOfShows);
  }
}

// vain ESPOO:Sello toimii, voisiko olla koska näyttää vain 132, ja Sello on yksi näistä?

function goButton(){
	console.log("button pressed");
	console.log(document.getElementById("theatre").value);
	document.getElementById("shows").innerHTML = ""; // Reset the element.
	var selectedTheater = document.getElementById("theatre").value;
	for (let i = 0; i < arrayOfShows.length; i++){
		if (arrayOfShows[i].theatre == selectedTheater){ //only print shows happening at selected theater.
			document.getElementById("shows").innerHTML += arrayOfShows[i].title;
			document.getElementById("shows").innerHTML += " ";
			document.getElementById("shows").innerHTML += arrayOfShows[i].theatre;
			document.getElementById("shows").innerHTML += "<br>";
		}

		
	}
}


