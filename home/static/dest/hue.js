'use strict';

var debug = { log: function log(msg) {} };
//var debug = console.log(msg)
var info = console;

var HueTemplate = {
	form: function form(type, idField) {
		var el = $("<form>");
		el.html(' \
			<div> \
				<label for="' + idField + '">' + idField + '</label> \
				<input type="text" name="' + idField + '"> \
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
		');
		el.addClass(type + '-value');
		el.addClass(type + '-form');
		return el;
	},
	list: function list(type) {
		var el = $('<ul>');
		el.addClass(type + '-list');
		return el;
	}
};

var LightForm = React.createClass({
	displayName: 'LightForm',

	getInitialState: function getInitialState() {
		return {};
	},
	componentDidMount: function componentDidMount() {
		var that = this;
		$.getJSON('/hue/lights/' + this.props.light_id, function (data) {
			if (that.isMounted()) {
				data.alert = null;
				that.setState(data);
			}
		});
	},
	handleChange: function handleChange(event) {
		var fieldChange = new Object();
		fieldChange[event.target.name] = event.target.value;
		this.setState(fieldChange);
	},
	saveForm: function saveForm(e) {
		e.preventDefault();
		info.log('LightForm.saveForm');
		info.log('/hue/lights/' + this.props.light_id);
		info.log(JSON.stringify(this.state));
		$.ajax({
			type: "POST",
			url: '/hue/lights/' + this.props.light_id,
			dataType: 'json',
			async: false,
			data: JSON.stringify(this.state),
			success: function success() {
				info.log("update complete");
				this.setState({ alert: null });
			}
		});
		return false;
	},
	render: function render() {
		return React.createElement(
			'form',
			{ className: 'lights-form', onSubmit: this.saveForm },
			React.createElement(
				'div',
				null,
				React.createElement(
					'label',
					{ htmlFor: 'light_id' },
					'light_id'
				),
				React.createElement('input', { type: 'text', name: 'light_id', value: this.props.light_id, disabled: 'disabled' })
			),
			React.createElement(
				'div',
				null,
				React.createElement(
					'label',
					{ htmlFor: 'name' },
					'name'
				),
				React.createElement('input', { type: 'text', name: 'name', value: this.state.name, onChange: this.handleChange })
			),
			React.createElement(
				'div',
				null,
				React.createElement(
					'label',
					{ htmlFor: 'on' },
					'on'
				),
				React.createElement(
					'select',
					{ name: 'on', value: this.state.on, onChange: this.handleChange },
					React.createElement(
						'option',
						{ value: 'true' },
						'True'
					),
					React.createElement(
						'option',
						{ value: 'false' },
						'False'
					)
				)
			),
			React.createElement(
				'div',
				null,
				React.createElement(
					'label',
					{ htmlFor: 'color' },
					'color'
				),
				React.createElement('input', { type: 'color', name: 'color', value: this.state.color, onChange: this.handleChange })
			),
			React.createElement(
				'div',
				null,
				React.createElement(
					'label',
					{ htmlFor: 'effect' },
					'effect'
				),
				React.createElement(
					'select',
					{ name: 'effect', value: this.state.effect, onChange: this.handleChange },
					React.createElement(
						'option',
						{ value: 'none' },
						'None'
					),
					React.createElement(
						'option',
						{ value: 'colorloop' },
						'Color Loop'
					)
				)
			),
			React.createElement(
				'div',
				null,
				React.createElement(
					'label',
					{ htmlFor: 'alert' },
					'alert'
				),
				React.createElement('input', { type: 'checkbox', name: 'alert', value: 'select', onChange: this.handleChange })
			),
			React.createElement(
				'div',
				null,
				React.createElement(
					'label',
					{ htmlFor: 'transitiontime' },
					'transitiontime'
				),
				React.createElement('input', { type: 'number', name: 'transitiontime', value: this.state.transitiontime, onChange: this.handleChange })
			),
			React.createElement(
				'div',
				null,
				React.createElement('input', { type: 'submit', value: 'Save' })
			)
		);
	}
});

var LightMenuItem = React.createClass({
	displayName: 'LightMenuItem',

	handleClick: function handleClick(i) {
		ReactDOM.render(React.createElement(LightForm, { light_id: this.props.data.id, options: this.props.options }), document.getElementById('hue-control'));
	},
	render: function render() {
		return React.createElement(
			'li',
			{ onClick: this.handleClick, key: this.props.data.id, 'data-id': this.props.data.id },
			this.props.data.name
		);
	}
});

var LightMenu = React.createClass({
	displayName: 'LightMenu',

	render: function render() {
		var that = this;
		return React.createElement(
			'ul',
			{ className: 'lights-list' },
			this.props.results.map(function (result) {
				return React.createElement(LightMenuItem, { key: result.name, data: result, options: that.props.options });
			})
		);
	}
});

var Light = {
	disabledFields: ['light_id'],
	toJson: function toJson(formEl) {
		info.log('Light.toJson');
		var dataArray = formEl.serializeArray();
		var data = new Object();
		debug.log(dataArray);
		dataArray.forEach(function (field) {
			data[field.name] = field.value;
		});
		debug.log(data);
		debug.log(arguments);
		data['on'] = data['on'] == "true" ? true : false;
		data['transitiontime'] = data['transitiontime'] == "" ? null : Number.parseFloat(data['transitiontime']);
		return data;
	},
	renderList: function renderList(options) {
		info.log('Light.renderList');
		$.getJSON('/hue/lights', function (data) {
			ReactDOM.render(React.createElement(LightMenu, { results: data, options: options }), document.getElementById('hue-menu'));
		});
	},
	save: function save(options) {
		info.log('Light.save');
		var formEl = $(options.form);
		Light.disabledFields.forEach(function (disabledField) {
			formEl.find("*[name=" + disabledField + "]").removeAttr('disabled');
		});
		var data = Light.toJson(formEl);
		Light.disabledFields.forEach(function (disabledField) {
			formEl.find("*[name=" + disabledField + "]").attr('disabled', "disabled");
		});
		debug.log(data);
		debug.log(arguments);
		debug.log(options);
		var light_id = data['light_id'];
		$.ajax({
			type: "POST",
			url: '/hue/lights/' + light_id,
			dataType: 'json',
			async: false,
			data: JSON.stringify(data),
			success: function success() {
				info.log("update complete");
				Light.renderList(options);
			}
		});
		return false;
	}
};

var Group = {
	disabledFields: ['group_id'],
	load: function load(groupId, options) {
		info.log('Group.load');
		debug.log(arguments);
		debug.log(options);
		$.getJSON('/hue/groups/' + groupId, function (data) {
			Group.buildForm(groupId, data, options);
		});
	},
	buildForm: function buildForm(groupId, data, options) {
		info.log('Group.buildForm');
		debug.log('Group(' + groupId + ') ->' + JSON.stringify(data));
		var formEl = $(options.form);
		formEl.html(HueTemplate.form('groups', 'group_id'));
		formEl.find("*[name=group_id]").val(groupId);
		for (var field_name in data) {
			if (field_name == "on") {
				formEl.find("*[name=on]").val(data[field_name].toString());
			} else {
				formEl.find("*[name=" + field_name + "]").val(data[field_name]);
			}
		}
		Group.disabledFields.forEach(function (disabledField) {
			formEl.find("*[name=" + disabledField + "]").attr('disabled', "disabled");
		});
		formEl.find("*[name=alert]").removeAttr("checked");
		formEl.on('submit', function () {
			Group.save(options);
		});
		var lightForm;
		data.lights.forEach(function (light) {
			lightForm = $("<div>");
			Light.buildForm(light.light_id, light, { form: lightForm });
			formEl.parent().append(lightForm);
		});
	},
	toJson: function toJson(formEl) {
		var dataArray = formEl.serializeArray();
		info.log('Group.toJson');
		debug.log(dataArray);
		var data = new Object();
		dataArray.forEach(function (field) {
			data[field.name] = field.value;
		});
		debug.log(data);
		debug.log(arguments);
		data['on'] = data['on'] == "true" ? true : false;
		data['transitiontime'] = data['transitiontime'] == "" ? null : Number.parseFloat(data['transitiontime']);
		return data;
	},
	renderList: function renderList(options) {
		info.log('Group.renderList');
		$.getJSON('/hue/groups', function (data) {
			Group.buildList(data, options);
		});
	},
	buildList: function buildList(data, options) {
		info.log('Group.buildList');
		debug.log(data);
		debug.log(arguments);
		debug.log(options);
		$(options.list).html("");
		data.forEach(function (object) {
			var group = $("<li>");
			group.attr('data-id', object[0]);
			group.html(object[1]);
			$(options.list).append(group);
		});
		$(options.list + " li").on("click", function () {
			Group.load($(this).attr("data-id"), options);
		});
	},
	save: function save(options) {
		info.log('Group.save');
		var formEl = $(options.form);
		Group.disabledFields.forEach(function (disabledField) {
			formEl.find("*[name=" + disabledField + "]").removeAttr('disabled');
		});
		var data = Group.toJson(formEl);
		Group.disabledFields.forEach(function (disabledField) {
			formEl.find("*[name=" + disabledField + "]").attr('disabled', "disabled");
		});
		debug.log(data);
		debug.log(arguments);
		debug.log(options);
		var group_id = data['group_id'];
		$.ajax({
			type: "POST",
			url: '/hue/groups/' + group_id,
			dataType: 'json',
			async: false,
			data: JSON.stringify(data),
			success: function success() {
				info.log("update complete");
				Group.renderList(options);
			}
		});
		return false;
	}
};

$(document).ready(function () {
	var options = {
		lights: { list: ".lights-list", form: ".lights-form" },
		groups: { list: ".groups-list", form: ".groups-form" },
		controlArea: "#hue-control",
		menuItems: "a.menu-control",
		menuArea: "#hue-menu"
	};
	var classes = {
		lights: Light,
		groups: Group
	};

	$(options.menuItems).on('click', function () {
		info.log('menu control');
		var menuType = $(this).attr('data-type');
		debug.log(menuType);
		$(options.menuArea).html("");
		classes[menuType].renderList(options[menuType]);
		//$(options.menuArea).append(HueTemplate.list(menuType));
		// $(options.controlArea).append(HueTemplate.form(menuType));
		//$(options[menuType].form).on('submit', function(){classes[menuType].save(options[menuType])});
	});
});