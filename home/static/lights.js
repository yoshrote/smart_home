"use strict";

var app = new Vue({
	el: '#hue-app',
	data: {
		lights: [],
		currentLight: null
	},
	created: function(){
		var v = this;
		getLights(function(json){
			v.lights = json;
		});
	},
	methods: {
		loadLight: function(event){
			var v = this;
			var currentLightId = event.target.getAttribute('data-id');
			getLight(currentLightId, function(json){
				v.currentLight = json;
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
