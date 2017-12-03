var arrayOfShows = [];
var areaID;

function show(id, title, theatre, showStart, image) {
	this.id = id; //int
	this.title = title; //string
	this.theatre = theatre; //int
	this.showStart = showStart; //string
	this.image = image; //string,url
}

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

go(); //autorun on launch.
function go(){
	arrayOfShows = [];
	console.log(document.getElementById("area").value);
	areaID = document.getElementById("area").value;
	var apiSchedule = new XMLHttpRequest();
	apiSchedule.open("GET","http://www.finnkino.fi/xml/Schedule/?area="+areaID,true);
	apiSchedule.send();
	apiSchedule.onreadystatechange=function() {
		if (apiSchedule.readyState==4 && apiSchedule.status==200){
		var xmlDoc = apiSchedule.responseXML;
		
		var showIDs = xmlDoc.getElementsByTagName("ID");
		var showTitles = xmlDoc.getElementsByTagName("Title");
		var showTheatre = xmlDoc.getElementsByTagName("Theatre");
		var showShowStarts = xmlDoc.getElementsByTagName("dttmShowStart");
		var showImages = xmlDoc.getElementsByTagName("EventLargeImagePortrait");

		var nodeTable = document.getElementById("shows");
		nodeTable.innerHTML = "<thead><tr><th colspan='3'>Näytökset</th></tr></thead>";

		for (let i = 0; i < showIDs.length; i++){
			
			var nodeTr = document.createElement("tr");
			nodeTr.id = "tr"+i;
			nodeTr.onclick = function(){ bounce(this.id); }
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
		}

		for (let i = 0; i < showIDs.length; i++){
			var newShow = new show(showIDs[i].innerHTML, showTitles[i].innerHTML, showTheatre[i].innerHTML, showShowStarts[i].innerHTML, showImages[i].innerHTML);
			console.log(newShow); // print each show to the console.
			arrayOfShows.push(newShow);

			var nodeTdText = document.createTextNode(showTitles[i].innerHTML);
			document.getElementById("td1"+i).appendChild(nodeTdText);

			var nodeTdText = document.createTextNode(showTheatre[i].innerHTML);
			document.getElementById("td2"+i).appendChild(nodeTdText);

			var nodeTdText = document.createTextNode(showShowStarts[i].innerHTML);
			document.getElementById("td3"+i).appendChild(nodeTdText);

			
			$(document).ready(function() {
				$("#tr"+i).fadeOut( 0, function(){ 
					$(".log").text('Fade In Transition Complete');
				 });	
			});
			
		}

		var counter = 0;
		for (let i = 0; i < showIDs.length; i++){
			counter += 1;
			myTimeout = setTimeout(function() {
				$(document).ready(function() {	
					$("#tr"+i).fadeIn( 'slow', function(){ 
						$(".log").text('Fade In Transition Complete');
					 });
				});
			}, counter * 25);
		}

		console.log(arrayOfShows);



		}	
	}

}

function bounce(id){
		$(document).ready(function() {	
			$( "#"+id ).effect( "bounce", {times:3}, 300 );
		});
}


