var debug = {log:function(msg){}}
//var debug = console.log(msg)
var info = console

var HueTemplate = {
	form: function(type, idField){
		var el = $("<form>")
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
		el.addClass(type+'-form')
		return el
	},
	list: function(type){
		var el = $('<ul>')
		el.addClass(type+'-list')
		return el;
	}
}

var LightForm = React.createClass({
	getInitialState: function() {
		return {};
	},
	componentDidMount: function() {
		var that = this;
		$.getJSON('/hue/lights/'+this.props.light_id, function(data){
			if(that.isMounted()){
				data.alert = null;
				that.setState(data)
			}
		});
	},
	handleChange: function(event) {
		var fieldChange = new Object();
		fieldChange[event.target.name] = event.target.value;
		this.setState(fieldChange);
	},
  	saveForm: function(e) {
		e.preventDefault();
		info.log('LightForm.saveForm');
		info.log('/hue/lights/'+this.props.light_id)
		info.log(JSON.stringify(this.state));
		$.ajax({
			type: "POST",
			url: '/hue/lights/'+this.props.light_id,
			dataType: 'json',
			async: false,
			data: JSON.stringify(this.state),
			success: function () {
				info.log("update complete");
				this.setState({alert: null})
			}
		});
		return false;
	},
  	render: function() {
		return (
			<form className="lights-form" onSubmit={this.saveForm}>
				<div>
					<label htmlFor="light_id">light_id</label>
					<input type="text" name="light_id" value={this.props.light_id} disabled="disabled"></input>
				</div>
				<div>
					<label htmlFor="name">name</label>
					<input type="text" name="name" value={this.state.name} onChange={this.handleChange} ></input>
				</div>
				<div>
					<label htmlFor="on">on</label>
					<select name="on" value={this.state.on} onChange={this.handleChange}>
						<option value="true">True</option>
						<option value="false">False</option>
					</select>
				</div>
				<div>
					<label htmlFor="color">color</label>
					<input type="color" name="color" value={this.state.color} onChange={this.handleChange}></input>
				</div>
				<div>
					<label htmlFor="effect">effect</label>
					<select name="effect" value={this.state.effect} onChange={this.handleChange}>
						<option value="none">None</option>
						<option value="colorloop">Color Loop</option>
					</select>
				</div>
				<div>
					<label htmlFor="alert">alert</label>
					<input type="checkbox" name="alert" value="select" onChange={this.handleChange}></input>
				</div>
				<div>
					<label htmlFor="transitiontime">transitiontime</label>
					<input type="number" name="transitiontime" value={this.state.transitiontime} onChange={this.handleChange}></input>
				</div>
				<div>
					<input type="submit" value="Save"></input>
				</div>
			</form>
		);
	}
})

var LightMenuItem = React.createClass({
	handleClick: function(i) {
		ReactDOM.render(
		  <LightForm light_id={this.props.data.id} options={this.props.options}/>,
		  document.getElementById('hue-control')
		);
	},
	render: function() {
		return (
		 	<li onClick={this.handleClick} key={this.props.data.id} data-id={this.props.data.id}>{this.props.data.name}</li>
		);
	}
})

var LightMenu = React.createClass({
  	render: function() {
  		var that = this;
		return (
			<ul className="lights-list">
	        {this.props.results.map(function(result) {
    	      return <LightMenuItem key={result.name} data={result} options={that.props.options}/>;
        	})}
			</ul>
		);
	}
})

var Light = {
	disabledFields: ['light_id'],
	toJson: function(formEl){
		info.log('Light.toJson');
		var dataArray = formEl.serializeArray();
		var data = new Object();
		debug.log(dataArray)
		dataArray.forEach(function(field){
			data[field.name] = field.value;
		});
		debug.log(data);
		debug.log(arguments)
		data['on'] = data['on'] == "true" ? true : false;
		data['transitiontime'] = data['transitiontime'] == "" ? null : Number.parseFloat(data['transitiontime']);
		return data;
	},
	renderList: function(options) {
		info.log('Light.renderList')
		$.getJSON('/hue/lights', function(data){
			ReactDOM.render(
			  <LightMenu results={data} options={options}/>,
			  document.getElementById('hue-menu')
			);
		});
	},
	save: function(options) {
		info.log('Light.save');
		var formEl = $(options.form)
		Light.disabledFields.forEach(function(disabledField) {
			formEl.find("*[name="+ disabledField +"]").removeAttr('disabled')
		})
		var data = Light.toJson(formEl);
		Light.disabledFields.forEach(function(disabledField) {
			formEl.find("*[name="+ disabledField +"]").attr('disabled', "disabled");
		})
		debug.log(data);
		debug.log(arguments)
		debug.log(options)
		var light_id = data['light_id'];
		$.ajax({
			type: "POST",
			url: '/hue/lights/'+light_id,
			dataType: 'json',
			async: false,
			data: JSON.stringify(data),
			success: function () {
				info.log("update complete");
				Light.renderList(options);
			}
		});
		return false;
	}
}

var Group = {
	disabledFields: ['group_id'],
	load: function(groupId, options){
		info.log('Group.load')
		debug.log(arguments)
		debug.log(options)
		$.getJSON('/hue/groups/'+groupId, function(data){
			Group.buildForm(groupId, data, options)
		});
	},
	buildForm: function(groupId, data, options){
		info.log('Group.buildForm')
		debug.log('Group('+groupId+') ->' + JSON.stringify(data))
		var formEl = $(options.form);
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
		formEl.find("*[name=alert]").removeAttr("checked")
		formEl.on('submit', function(){Group.save(options)});
		var lightForm;
		data.lights.forEach(function(light){
			lightForm = $("<div>")
			Light.buildForm(light.light_id, light, {form: lightForm})
			formEl.parent().append(lightForm)
		})
	},
	toJson: function(formEl){
		var dataArray = formEl.serializeArray();
		info.log('Group.toJson');
		debug.log(dataArray)
		var data = new Object();
		dataArray.forEach(function(field){
			data[field.name] = field.value;
		});
		debug.log(data);
		debug.log(arguments)
		data['on'] = data['on'] == "true" ? true : false;
		data['transitiontime'] = data['transitiontime'] == "" ? null : Number.parseFloat(data['transitiontime']);
		return data;
	},
	renderList: function(options){
		info.log('Group.renderList')
		$.getJSON('/hue/groups', function(data){
			Group.buildList(data, options)
		})
	},
	buildList: function(data, options){
		info.log('Group.buildList')
		debug.log(data)
		debug.log(arguments)
		debug.log(options)
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
	},
	save: function(options) {
		info.log('Group.save');
		var formEl = $(options.form)
		Group.disabledFields.forEach(function(disabledField) {
			formEl.find("*[name="+ disabledField +"]").removeAttr('disabled')
		})
		var data = Group.toJson(formEl);
		Group.disabledFields.forEach(function(disabledField) {
			formEl.find("*[name="+ disabledField +"]").attr('disabled', "disabled");
		})
		debug.log(data);
		debug.log(arguments)
		debug.log(options)
		var group_id = data['group_id'];
		$.ajax({
			type: "POST",
			url: '/hue/groups/'+group_id,
			dataType: 'json',
			async: false,
			data: JSON.stringify(data),
			success: function () {
				info.log("update complete");
				Group.renderList(options);
			}
		});
		return false;
	}
}

$(document).ready(function(){
	var options = {
		lights: {list: ".lights-list", form: ".lights-form"},
		groups: {list: ".groups-list", form: ".groups-form"},
		controlArea: "#hue-control",
		menuItems: "a.menu-control",
		menuArea: "#hue-menu"
	}
	var classes = {
		lights: Light,
		groups: Group
	}

	$(options.menuItems).on('click', function(){
		info.log('menu control')
		var menuType = $(this).attr('data-type');
		debug.log(menuType)
		$(options.menuArea).html("");
		classes[menuType].renderList(options[menuType])
		//$(options.menuArea).append(HueTemplate.list(menuType));
		// $(options.controlArea).append(HueTemplate.form(menuType));
		//$(options[menuType].form).on('submit', function(){classes[menuType].save(options[menuType])});
	})
});
