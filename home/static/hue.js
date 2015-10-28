var debug = function(msg){
	//console.log(msg)
}
var info = function(msg){
	console.log(msg)
}

var HueTemplate = {
	form: function(type, idField){
		var el = $("<div>")
		el.html(' \
			<div> \
				<label for="'+idField+'">'+idField+'</label> \
				<input type="text" name="'+idField+'"> \
			</div> \
			<div> \
				<label for="name">name</label> \
				<input type="text" name="name"> \
			</div> \
			<div> \
				<label for="on">on</label> \
				<select name="on"> \
					<option value="true">True</option> \
					<option value="false">False</option> \
				</select> \
			</div> \
			<div> \
				<label for="color">color</label> \
				<input type="color" name="color"></input> \
			</div> \
			<div> \
				<label for="effect">effect</label> \
				<select name="effect"> \
					<option value="none" selected>None</option> \
					<option value="colorloop">Color Loop</option> \
				</select> \
			</div> \
			<div> \
				<label for="alert">alert</label> \
				<input type="checkbox" name="alert" value="select"></input> \
			</div> \
			<div> \
				<label for="transitiontime">transitiontime</label> \
				<input type="number" name="transitiontime"> \
			</div> \
			<div> \
				<input type="submit" value="Save"> \
			</div> \
		')
		el.addClass(type+'-value')
		return el
	},
	container: function(type, idField){
		var el = $("<div>")
		el.html(' \
			<div>'+type+'</div> \
			<ul class="'+type+'-list"></ul> \
			<form class="'+type+'-form"></form> \
		')
		el.addClass(type+'-container')
		if (idField !== null) {
			el.attr('id', idField)
		}
		return el
	}
}

var Light = {
	disabledFields: ['light_id'],
	load: function(lightId, options){
		info('Light.load')
		debug(arguments)
		debug(options)
		var formEl = $(options.form);
		formEl.find("*[name=alert]").removeAttr("checked")
		$.getJSON('/hue/lights/'+lightId, function(data){
			debug('Light('+lightId+') ->' + JSON.stringify(data))
			formEl.html(HueTemplate.form('lights', 'light_id'))
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
	load: function(groupId, options){
		info('Group.load')
		debug(arguments)
		debug(options)
		var formEl = $(options.form);
		formEl.find("*[name=alert]").removeAttr("checked")
		$.getJSON('/hue/groups/'+groupId, function(data){
			debug('Group('+groupId+') ->' + JSON.stringify(data))
			formEl.html(HueTemplate.form('groups', 'group_id'))
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
	var options = {
		lights: {list: ".lights-list", form: ".lights-form", fields: ".lights-value"},
		groups: {list: ".groups-list", form: ".groups-form", fields: ".groups-value"},
		controlArea: "#hue-control",
		menuItems: "a.menu-control"
	}
	var classes = {
		lights: Light,
		groups: Group
	}

	$(options.menuItems).on('click', function(){
		info('menu control')
		var menuType = $(this).attr('data-type');
		info(menuType)
		$(options.controlArea).html(HueTemplate.container(menuType));
		$(options[menuType].form).on('submit', function(){classes[menuType].save(options[menuType])});
		classes[menuType].renderList(options[menuType])
	})
});
