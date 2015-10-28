var debug = function(msg){
	//console.log(msg)
}
var info = function(msg){
	console.log(msg)
}


var Light = {
	disabledFields: ['light_id'],
	load: function(context, lightId, options){
		info('load')
		info(context)
		debug(arguments)
		info(options)
		var formEl = $(options.lights.form);
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
		var dataArray = formEl.serializeArray();
		info('toJson');
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
	renderList: function(data, options) {
		$(options.lights.list).html("");
		info('renderList')
		debug(data)
		debug(arguments)
		debug(options)
		data.forEach(function(object){
			var light = $("<li>");
			light.attr('data-id', object[0])
			light.html(object[1]);
			$(options.lights.list).append(light);
		});
		$(options.lights.list + " li").on("click", function(){Light.load(
			this,
			$(this).attr("data-id"),
			options
		)});
	},
	save: function(options) {
		info('save');
		var formEl = $(options.lights.form)
		Light.disabledFields.forEach(function(disabledField) {
			formEl.find("*[name="+ disabledField +"]").removeAttr('disabled')
		})
		var data = Light.toJson(formEl);
		Light.disabledFields.forEach(function(disabledField) {
			formEl.find("*[name="+ disabledField +"]").attr('disabled', "disabled");
		})
		info(data);
		debug(arguments)
		info(options)
		var light_id = data['light_id'];
		$.ajax({
			type: "POST",
			url: '/hue/lights/'+light_id,
			dataType: 'json',
			async: false,
			data: JSON.stringify(data),
			success: function () {
				info("update complete");
				getMenu(options);
			}
		});
		return false;
	}
}

var Group = {
	disabledFields: ['group_id'],
	load: function(context, groupId, options){
		info('load')
		debug(context)
		debug(arguments)
		debug(options)
		var formEl = $(options.groups.form);
		formEl.find("*[name=alert]").removeAttr("checked")
		$.getJSON('/hue/groups/'+groupId, function(data){
			info('Group('+groupId+') ->' + JSON.stringify(data))
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
		info('toJson');
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
	renderList: function(data, options){
		info('renderList')
		debug(data)
		debug(arguments)
		debug(options)
		$(options.groups.list).html("");
		data.forEach(function(object){
			var group = $("<li>");
			group.attr('data-id', object[0])
			group.html(object[1]);
			$(options.groups.list).append(group);

		});
		$(options.groups.list + " li").on("click", function(){Group.load(
			this,
			$(this).attr("data-id"),
			options
		)});
	},
	save: function(options) {
		info('save');
		var formEl = $(options.groups.form)
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
				getMenu(options);
			}
		});
		return false;
	}
}

var getMenu = function(options){
	$.getJSON('/hue/lights', function(data){
		Light.renderList(data, options)
	});
	$.getJSON('/hue/groups', function(data){
		Group.renderList(data, options)
	});
}

$(document).ready(function(){
	options = {
		lights: {list: "#lights-list", form: "#lights-form"},
		groups: {list: "#groups-list", form: "#groups-form"}
	}
	getMenu(options);

	$(options.lights.form).on('submit', function(){Light.save(options)});
	$(options.groups.form).on('submit', function(){Group.save(options)});
});
