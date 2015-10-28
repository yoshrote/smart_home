var debug = function(msg){
	//console.log(msg)
}
var info = function(msg){
	console.log(msg)
}


var Light = {
	disabledFields: ['x', 'y', 'colormode', 'light_id', 'colortemp_k'],
	load: function(context, lightId){
		info('load')
		debug(context)
		debug(arguments)
		var formEl = $("#light-form");
		formEl.find("*[name=alert]").removeAttr("checked")
		$.getJSON('/hue/lights/'+lightId, function(data){
			debug('Light('+lightId+') ->' + JSON.stringify(data))
			formEl.find("*[name=light_id]").val(lightId);
			for(var field_name in data) {
				if(field_name == "xy"){
					formEl.find("*[name=x]").val(data[field_name][0]);
					formEl.find("*[name=y]").val(data[field_name][1]);
				} else if(field_name == "on"){
					formEl.find("*[name=on]").val(data[field_name].toString());
				} else {
					formEl.find("*[name="+field_name+"]").val(data[field_name]);
				}
			}
			Light.disabledFields.forEach(function(disabledField) {
				formEl.find("*[name="+ disabledField +"]").attr('disabled', "disabled");	
			})
		});
	},
	toJson: function(formEl){
		var dataArray = formEl.serializeArray();
		info('toJson');
		debug(dataArray)
		var data = new Object();
		dataArray.forEach(function(field){
			data[field.name] = field.value;
		});
		debug(data);
		debug(arguments)
		// data['colortemp_k'] = Number.parseInt(data['colortemp_k'])
		// data['x'] = Number.parseInt(data['x'])
		// data['y'] = Number.parseInt(data['y'])
		data['on'] = data['on'] == "true" ? true : false;
		// data['hue'] = Number.parseInt(data['hue'])
		// data['brightness'] = Number.parseInt(data['brightness'])
		// data['saturation'] = Number.parseInt(data['saturation'])
		data['transitiontime'] = data['transitiontime'] == "" ? null : Number.parseFloat(data['transitiontime']);

		delete data['colormode']
		// delete data['color']
		delete data['colortemp_k']
		delete data['x'];
		delete data['y'];
		delete data['hue']
		delete data['brightness']
		delete data['saturation']

		return data;
	},
	renderList: function(data) {
		$("#lights-list").html("");
		info('renderList')
		debug(data)
		debug(arguments)
		data.forEach(function(object){
			var light = $("<li>");
			light.attr('data-id', object[0])
			light.html(object[1]);
			$("#lights-list").append(light);
		});
		$("#lights-list li").on("click", function(){Light.load(this, $(this).attr("data-id"))});
	},
	save: function() {
		info('save');
		var formEl = $("#light-form")
		Light.disabledFields.forEach(function(disabledField) {
			formEl.find("*[name="+ disabledField +"]").removeAttr('disabled')
		})
		var data = Light.toJson(formEl);
		Light.disabledFields.forEach(function(disabledField) {
			formEl.find("*[name="+ disabledField +"]").attr('disabled', "disabled");
		})
		debug(data);
		debug(arguments)
		var light_id = data['light_id'];
		$.ajax({
			type: "POST",
			url: '/hue/lights/'+light_id,
			dataType: 'json',
			async: false,
			data: JSON.stringify(data),
			success: function () {
				info("update complete");
				getMenu();
			}
		});
		return false;
	}
}

var Group = {
	load: function(){
		$.getJSON('/hue/groups/'+$(this).attr("data-id"), function(data){
			$("#group-value").text(JSON.stringify(data, null, 4));
		});
	},
	renderList: function(data){
		$("#groups-list").html("");
		data.forEach(function(object){
			var group = $("<li>");
			group.attr('data-id', object[0])
			group.html(object[1]);
			$("#groups-list").append(group);

		});
		$("#groups-list li").on("click", Group.load);
	},
	save: function(){}
}

var getMenu = function(){
	$.getJSON('/hue/lights', Light.renderList, {list: "#lights-list"});
	$.getJSON('/hue/groups', Group.renderList);
}

$(document).ready(function(){
	getMenu();

	$("#light-form").on('submit', Light.save);
	$("#group-form").on('submit', Group.save);
});