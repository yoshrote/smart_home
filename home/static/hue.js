var debug = function(msg){
	//console.log(msg)
}
var info = function(msg){
	console.log(msg)
}


var Light = {
	disabledFields: ['light_id'],
	load: function(context, lightId, options){
		info('Light.load')
		debug(context)
		debug(arguments)
		debug(options)
		var formEl = $(options.form);
		formEl.find("*[name=alert]").removeAttr("checked")
		$.getJSON('/hue/lights/'+lightId, function(data){
			debug('Light('+lightId+') ->' + JSON.stringify(data))
			formEl.find("*[name=light_id]").val(lightId);
			for(var field_name in data) {
				if(field_name == "on"){
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
		info('Light.toJson');
		var dataArray = formEl.serializeArray();
		var data = new Object();
		debug(dataArray)
		dataArray.forEach(function(field){
			data[field.name] = field.value;
		});
		debug(data);
		debug(arguments)
		data['on'] = data['on'] == "true" ? true : false;
		data['transitiontime'] = data['transitiontime'] == "" ? null : Number.parseFloat(data['transitiontime']);
		return data;
	},
	renderList: function(options) {
		info('Light.renderList')
		$.getJSON('/hue/lights', function(data){
			debug(data)
			debug(arguments)
			debug(options)
			$(options.list).html("");
			data.forEach(function(object){
				var light = $("<li>");
				light.attr('data-id', object[0])
				light.html(object[1]);
				$(options.list).append(light);
			});
			$(options.list + " li").on("click", function(){Light.load(
				this,
				$(this).attr("data-id"),
				options
			)});
		});
	},
	save: function(options) {
		info('Light.save');
		var formEl = $(options.form)
		Light.disabledFields.forEach(function(disabledField) {
			formEl.find("*[name="+ disabledField +"]").removeAttr('disabled')
		})
		var data = Light.toJson(formEl);
		Light.disabledFields.forEach(function(disabledField) {
			formEl.find("*[name="+ disabledField +"]").attr('disabled', "disabled");
		})
		debug(data);
		debug(arguments)
		debug(options)
		var light_id = data['light_id'];
		$.ajax({
			type: "POST",
			url: '/hue/lights/'+light_id,
			dataType: 'json',
			async: false,
			data: JSON.stringify(data),
			success: function () {
				info("update complete");
				Light.renderList(options);
			}
		});
		return false;
	}
}

var Group = {
	disabledFields: ['group_id'],
	load: function(context, groupId, options){
		info('Group.load')
		debug(context)
		debug(arguments)
		debug(options)
		var formEl = $(options.form);
		formEl.find("*[name=alert]").removeAttr("checked")
		$.getJSON('/hue/groups/'+groupId, function(data){
			debug('Group('+groupId+') ->' + JSON.stringify(data))
			formEl.find("*[name=group_id]").val(groupId);
			for(var field_name in data) {
				if(field_name == "on"){
					formEl.find("*[name=on]").val(data[field_name].toString());
				} else {
					formEl.find("*[name="+field_name+"]").val(data[field_name]);
				}
			}
			Group.disabledFields.forEach(function(disabledField) {
				formEl.find("*[name="+ disabledField +"]").attr('disabled', "disabled");	
			})
		});
	},
	toJson: function(formEl){
		var dataArray = formEl.serializeArray();
		info('Group.toJson');
		debug(dataArray)
		var data = new Object();
		dataArray.forEach(function(field){
			data[field.name] = field.value;
		});
		debug(data);
		debug(arguments)
		data['on'] = data['on'] == "true" ? true : false;
		data['transitiontime'] = data['transitiontime'] == "" ? null : Number.parseFloat(data['transitiontime']);
		return data;
	},
	renderList: function(options){
		info('Group.renderList')
		$.getJSON('/hue/groups', function(data){
			debug(data)
			debug(arguments)
			debug(options)
			$(options.list).html("");
			data.forEach(function(object){
				var group = $("<li>");
				group.attr('data-id', object[0])
				group.html(object[1]);
				$(options.list).append(group);

			});
			$(options.list + " li").on("click", function(){Group.load(
				this,
				$(this).attr("data-id"),
				options
			)});
		})
	},
	save: function(options) {
		info('Group.save');
		var formEl = $(options.form)
		Group.disabledFields.forEach(function(disabledField) {
			formEl.find("*[name="+ disabledField +"]").removeAttr('disabled')
		})
		var data = Group.toJson(formEl);
		Group.disabledFields.forEach(function(disabledField) {
			formEl.find("*[name="+ disabledField +"]").attr('disabled', "disabled");
		})
		debug(data);
		debug(arguments)
		debug(options)
		var group_id = data['group_id'];
		$.ajax({
			type: "POST",
			url: '/hue/groups/'+group_id,
			dataType: 'json',
			async: false,
			data: JSON.stringify(data),
			success: function () {
				info("update complete");
				Group.renderList(options);
			}
		});
		return false;
	}
}

$(document).ready(function(){
	options = {
		lights: {list: "#lights-list", form: "#lights-form"},
		groups: {list: "#groups-list", form: "#groups-form"}
	}
	Light.renderList(options.lights)
	Group.renderList(options.groups)

	$(options.lights.form).on('submit', function(){Light.save(options.lights)});
	$(options.groups.form).on('submit', function(){Group.save(options.groups)});
});
