"use strict";

var app = new Vue({
	el: '#hue-app',
	data: {
		lights: [],
		currentLight: null
	},
	created: function(){
		var v = this;
		console.log('fetching: /hue/lights')
		fetch('/hue/lights').then(function(response){
			response.json().then(function(json){
				console.log('Menu items:');
				console.log(json);
				v.lights = json;
			});
		});
	},
	methods: {
		loadLight: function(event){
			var v = this;
			var currentLightId = event.target.getAttribute('data-id');
			console.log('fetching: /hue/lights/'+currentLightId);
			fetch('/hue/lights/'+currentLightId).then(function(response){
				response.json().then(function(json){
					console.log('Light:');
					console.log(json);
					v.currentLight = json;
				});
			});
		},
		saveLight: function(event){
			console.log('Saving: '+JSON.stringify(this.currentLight))
			fetch('/hue/lights/' + this.currentLight.light_id, {
				method: 'post',
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(this.currentLight)
			});
		}
	}
});
