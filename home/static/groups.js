"use strict";

var app = new Vue({
	el: '#hue-app',
	data: {
		groups: [],
		lights: [],
		currentGroup: null
	},
	created: function(){
		var v = this;
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
		loadGroup: function(event){
			var v = this;
			var currentGroupId = event.target.getAttribute('data-id');

			getGroup(currentGroupId, function(json){
				v.currentGroup = json;
				var lights = v.currentGroup.lights;
				var groupLights = [];
				for (var i = 0, len = lights.length; i < len; i++){
					groupLights.push(lights[i].light_id.toString());
				}
				v.currentGroup.lights = groupLights;
			});
		},
		saveGroup: function(event){
			console.log('Saving: '+JSON.stringify(this.currentGroup))
			fetch('/hue/groups/' + this.currentGroup.group_id, {
				method: 'post',
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(this.currentGroup)
			});
		}
	}
});
