"use strict";

var getLights = function(callback){
	console.log('fetching: /hue/lights');
	fetch('/hue/lights').then(function(response){
		response.json().then(function(json){
			console.log('Lights:');
			console.log(json);
			callback(json);
		});
	});
}

var getLight = function(lightID, callback){
	console.log('fetching: /hue/lights/'+lightID);
	fetch('/hue/lights/'+lightID).then(function(response){
		response.json().then(function(json){
			console.log('Light '+lightID+':');
			console.log(json);
			callback(json);
		});
	});
}

var getGroups = function(callback){
	console.log('fetching: /hue/groups');
	fetch('/hue/groups').then(function(response){
		response.json().then(function(json){
			console.log('Groups:');
			console.log(json);
			callback(json);
		});
	});
}

var getGroup = function(groupID, callback){
	console.log('fetching: /hue/groups/+groupID');
	fetch('/hue/groups/'+groupID).then(function(response){
		response.json().then(function(json){
			console.log('Group '+groupID+':');
			console.log(json);
			callback(json);
		});
	});
}
