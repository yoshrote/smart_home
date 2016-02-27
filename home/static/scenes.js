"use strict";

var app = new Vue({
	el: '#hue-app',
	data: {
		scenes: [],
		groups: [],
		lights: [],
		currentScene: null
	},
	created: function(){
		var v = this;
		getScenes(function(json){
			v.scenes = json;
		});
		getGroups(function(json){
			v.groups = json;
		});
		getLights(function(json){
			var lightList = [];
			console.log('populate lights')
			for (var i = 0, len = json.length; i < len; i++){
				lightList.push(json[i])
			}
			v.lights = lightList;
		});
	},
	methods: {
		loadScene: function(event){
			var v = this;
			var currentSceneId = event.target.getAttribute('data-id');

			getScene(currentSceneId, function(json){
				v.currentScene = json;
				var lights = v.currentScene.lights;
				var sceneLights = [];
				for (var i = 0, len = lights.length; i < len; i++){
					sceneLights.push(lights[i].light_id.toString());
				}
				v.currentScene.lights = sceneLights;
			});
		},
		saveScene: function(event){
			console.log('Saving: '+JSON.stringify(this.currentScene))
			fetch('/hue/scenes/' + this.currentScene.scene_id, {
				method: 'post',
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(this.currentScene)
			});
		},
		createScene: function(event){},
		deleteScene: function(event){}
	}
});
