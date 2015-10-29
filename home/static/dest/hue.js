"use strict";

var debug = { log: function log(msg) {} };
//var debug = console.log(msg)
var info = console;

var LightForm = React.createClass({
	displayName: "LightForm",

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
		var that = this;
		if (this.state.on == "true") {
			this.setState({ on: true });
		} else {
			this.setState({ on: false });
		}
		if (this.state.transitiontime == "") {
			this.setState({ transitiontime: null });
		} else {
			this.setState({ transitiontime: Number.parseFloat(this.state.transitiontime) });
		}
		$.ajax({
			type: "POST",
			url: '/hue/lights/' + this.props.light_id,
			dataType: 'json',
			async: false,
			data: JSON.stringify(this.state),
			success: function success() {
				info.log("update complete");
				that.setState({ alert: null });
			}
		});
		return false;
	},
	render: function render() {
		return React.createElement(
			"form",
			{ className: "lights-form", onSubmit: this.saveForm },
			React.createElement(
				"div",
				null,
				React.createElement(
					"label",
					{ htmlFor: "light_id" },
					"light_id"
				),
				React.createElement("input", { type: "text", name: "light_id", value: this.props.light_id, disabled: "disabled" })
			),
			React.createElement(
				"div",
				null,
				React.createElement(
					"label",
					{ htmlFor: "name" },
					"name"
				),
				React.createElement("input", { type: "text", name: "name", value: this.state.name, onChange: this.handleChange })
			),
			React.createElement(
				"div",
				null,
				React.createElement(
					"label",
					{ htmlFor: "on" },
					"on"
				),
				React.createElement(
					"select",
					{ name: "on", value: this.state.on, onChange: this.handleChange },
					React.createElement(
						"option",
						{ value: "true" },
						"True"
					),
					React.createElement(
						"option",
						{ value: "false" },
						"False"
					)
				)
			),
			React.createElement(
				"div",
				null,
				React.createElement(
					"label",
					{ htmlFor: "color" },
					"color"
				),
				React.createElement("input", { type: "color", name: "color", value: this.state.color, onChange: this.handleChange })
			),
			React.createElement(
				"div",
				null,
				React.createElement(
					"label",
					{ htmlFor: "effect" },
					"effect"
				),
				React.createElement(
					"select",
					{ name: "effect", value: this.state.effect, onChange: this.handleChange },
					React.createElement(
						"option",
						{ value: "none" },
						"None"
					),
					React.createElement(
						"option",
						{ value: "colorloop" },
						"Color Loop"
					)
				)
			),
			React.createElement(
				"div",
				null,
				React.createElement(
					"label",
					{ htmlFor: "alert" },
					"alert"
				),
				React.createElement("input", { type: "checkbox", name: "alert", value: "select", onChange: this.handleChange })
			),
			React.createElement(
				"div",
				null,
				React.createElement(
					"label",
					{ htmlFor: "transitiontime" },
					"transitiontime"
				),
				React.createElement("input", { type: "number", name: "transitiontime", value: this.state.transitiontime, onChange: this.handleChange })
			),
			React.createElement(
				"div",
				null,
				React.createElement("input", { type: "submit", value: "Save" })
			)
		);
	}
});

var LightMenuItem = React.createClass({
	displayName: "LightMenuItem",

	handleClick: function handleClick(i) {
		ReactDOM.render(React.createElement(LightForm, { key: this.props.data.id, light_id: this.props.data.id, options: this.props.options }), document.getElementById('hue-control'));
	},
	render: function render() {
		return React.createElement(
			"li",
			{ onClick: this.handleClick, key: this.props.data.id, "data-id": this.props.data.id },
			this.props.data.name
		);
	}
});

var LightMenu = React.createClass({
	displayName: "LightMenu",

	render: function render() {
		var that = this;
		return React.createElement(
			"ul",
			{ className: "lights-list" },
			this.props.results.map(function (result) {
				return React.createElement(LightMenuItem, { key: result.name, data: result, options: that.props.options });
			})
		);
	}
});

var GroupForm = React.createClass({
	displayName: "GroupForm",

	getInitialState: function getInitialState() {
		return { lights: [] };
	},
	componentDidMount: function componentDidMount() {
		var that = this;
		$.getJSON('/hue/groups/' + this.props.group_id, function (data) {
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
		var that = this;
		if (this.state.on == "true") {
			this.setState({ on: true });
		} else {
			this.setState({ on: false });
		}
		if (this.state.transitiontime == "") {
			this.setState({ transitiontime: null });
		} else {
			this.setState({ transitiontime: Number.parseFloat(this.state.transitiontime) });
		}
		$.ajax({
			type: "POST",
			url: '/hue/groups/' + this.props.group_id,
			dataType: 'json',
			async: false,
			data: JSON.stringify(this.state),
			success: function success() {
				info.log("update complete");
				that.setState({ alert: null });
			}
		});
		return false;
	},
	render: function render() {
		var that = this;
		return React.createElement(
			"div",
			null,
			React.createElement(
				"form",
				{ className: "groups-form", onSubmit: this.saveForm },
				React.createElement(
					"div",
					null,
					React.createElement(
						"label",
						{ htmlFor: "group_id" },
						"group_id"
					),
					React.createElement("input", { type: "text", name: "group_id", value: this.props.group_id, disabled: "disabled" })
				),
				React.createElement(
					"div",
					null,
					React.createElement(
						"label",
						{ htmlFor: "name" },
						"name"
					),
					React.createElement("input", { type: "text", name: "name", value: this.state.name, onChange: this.handleChange })
				),
				React.createElement(
					"div",
					null,
					React.createElement(
						"label",
						{ htmlFor: "on" },
						"on"
					),
					React.createElement(
						"select",
						{ name: "on", value: this.state.on, onChange: this.handleChange },
						React.createElement(
							"option",
							{ value: "true" },
							"True"
						),
						React.createElement(
							"option",
							{ value: "false" },
							"False"
						)
					)
				),
				React.createElement(
					"div",
					null,
					React.createElement(
						"label",
						{ htmlFor: "color" },
						"color"
					),
					React.createElement("input", { type: "color", name: "color", value: this.state.color, onChange: this.handleChange })
				),
				React.createElement(
					"div",
					null,
					React.createElement(
						"label",
						{ htmlFor: "effect" },
						"effect"
					),
					React.createElement(
						"select",
						{ name: "effect", value: this.state.effect, onChange: this.handleChange },
						React.createElement(
							"option",
							{ value: "none" },
							"None"
						),
						React.createElement(
							"option",
							{ value: "colorloop" },
							"Color Loop"
						)
					)
				),
				React.createElement(
					"div",
					null,
					React.createElement(
						"label",
						{ htmlFor: "alert" },
						"alert"
					),
					React.createElement("input", { type: "checkbox", name: "alert", value: "select", onChange: this.handleChange })
				),
				React.createElement(
					"div",
					null,
					React.createElement(
						"label",
						{ htmlFor: "transitiontime" },
						"transitiontime"
					),
					React.createElement("input", { type: "number", name: "transitiontime", value: this.state.transitiontime, onChange: this.handleChange })
				),
				React.createElement(
					"div",
					null,
					React.createElement("input", { type: "submit", value: "Save" })
				)
			),
			React.createElement(
				"div",
				{ className: "group-lights" },
				this.state.lights.map(function (result) {
					return React.createElement(LightForm, { key: result.light_id, light_id: result.light_id, options: that.props.options });
				})
			)
		);
	}
});

var GroupMenuItem = React.createClass({
	displayName: "GroupMenuItem",

	handleClick: function handleClick(i) {
		ReactDOM.render(React.createElement(GroupForm, { group_id: this.props.data.id, options: this.props.options }), document.getElementById('hue-control'));
	},
	render: function render() {
		return React.createElement(
			"li",
			{ onClick: this.handleClick, key: this.props.data.id, "data-id": this.props.data.id },
			this.props.data.name
		);
	}
});

var GroupMenu = React.createClass({
	displayName: "GroupMenu",

	render: function render() {
		var that = this;
		return React.createElement(
			"ul",
			{ className: "groups-list" },
			this.props.results.map(function (result) {
				return React.createElement(GroupMenuItem, { key: result.name, data: result, options: that.props.options });
			})
		);
	}
});

var renderMenu = {
	lights: function lights(options) {
		$.getJSON('/hue/lights', function (data) {
			ReactDOM.render(React.createElement(LightMenu, { results: data, options: options }), document.getElementById('hue-menu'));
		});
	},
	groups: function groups(options) {
		$.getJSON('/hue/groups', function (data) {
			ReactDOM.render(React.createElement(GroupMenu, { results: data, options: options }), document.getElementById('hue-menu'));
		});
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

	$(options.menuItems).on('click', function () {
		info.log('menu control');
		var menuType = $(this).attr('data-type');
		debug.log(menuType);
		$(options.menuArea).html("");
		$(options.controlArea).html("");
		renderMenu[menuType](options[menuType]);
	});
});