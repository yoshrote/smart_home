var debug = {log:function(msg){}}
//var debug = console.log(msg)
var info = console


var LightForm = React.createClass({
	getInitialState: function() {
		return {};
	},
	componentDidMount: function() {
		if(this.props.loadUrl !== undefined){
			var that = this;
			$.getJSON('/hue/lights/'+this.props.light_id, function(data){
				if(that.isMounted()){
					data.alert = null;
					that.setState(data)
				}
			});
		}
	},
	handleChange: function(event) {
		var fieldChange = new Object();
		fieldChange[event.target.name] = event.target.value;
		this.setState(fieldChange);
	},
  	saveForm: function(e) {
		e.preventDefault();
		var that = this
		if(this.state.on == "true"){
			this.setState({on: true})
		} else {
			this.setState({on: false})
		}
		if(this.state.transitiontime == ""){
			this.setState({transitiontime: null})
		} else {
			this.setState({transitiontime: Number.parseFloat(this.state.transitiontime)})
		}
		$.ajax({
			type: "POST",
			url: this.props.saveUrl,
			dataType: 'json',
			async: false,
			data: JSON.stringify(this.state),
			success: function () {
				info.log("update complete");
				that.setState({alert: null})
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
		  <LightForm key={this.props.data.id} loadUrl={'/hue/lights/'+this.props.data.id} saveUrl={'/hue/lights/'+this.props.data.id} light_id={this.props.data.id} options={this.props.options}/>,
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
	},
	fromUrl: function(url, node, options) {
		$.getJSON(url, function(data){
			ReactDOM.render(
			  <LightMenu results={data} options={options}/>,
			  node
			);
		})
	}
})

var GroupForm = React.createClass({
	getInitialState: function() {
		return {lights:[]};
	},
	componentDidMount: function() {
		if(this.props.loadUrl !== undefined){
			var that = this;
			$.getJSON(this.props.loadUrl, function(data){
				if(that.isMounted()){
					data.alert = null;
					that.setState(data)
				}
			});
		}
	},
	handleChange: function(event) {
		var fieldChange = new Object();
		fieldChange[event.target.name] = event.target.value;
		this.setState(fieldChange);
	},
  	saveForm: function(e) {
		e.preventDefault();
		var that = this
		if(this.state.on == "true"){
			this.setState({on: true})
		} else {
			this.setState({on: false})
		}
		if(this.state.transitiontime == ""){
			this.setState({transitiontime: null})
		} else {
			this.setState({transitiontime: Number.parseFloat(this.state.transitiontime)})
		}
		$.ajax({
			type: "POST",
			url: this.props.saveUrl,
			dataType: 'json',
			async: false,
			data: JSON.stringify(this.state),
			success: function () {
				info.log("update complete");
				that.setState({alert: null})
			}
		});
		return false;
	},
  	render: function() {
  		var that = this;
		return (
			<div>
				<form className="groups-form" onSubmit={this.saveForm}>
					<div>
						<label htmlFor="group_id">group_id</label>
						<input type="text" name="group_id" value={this.props.group_id} disabled="disabled"></input>
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
				<div className="group-lights">
				{this.state.lights.map(function(result) {
					return <LightForm key={result.light_id} loadUrl={'/hue/lights/'+result.light_id} saveUrl={'/hue/lights/'+result.light_id} light_id={result.light_id} options={that.props.options}/>;
				})}
				</div>
			</div>
		);
	}
})

var GroupMenuItem = React.createClass({
	handleClick: function(i) {
		ReactDOM.render(
		  <GroupForm group_id={this.props.data.id} loadUrl={'/hue/groups/'+this.props.data.id} saveUrl={'/hue/groups/'+this.props.data.id} options={this.props.options}/>,
		  document.getElementById('hue-control')
		);
	},
	render: function() {
		return (
		 	<li onClick={this.handleClick} key={this.props.data.id} data-id={this.props.data.id}>{this.props.data.name}</li>
		);
	}
})

var GroupMenu = React.createClass({
  	render: function() {
  		var that = this;
		return (
			<ul className="groups-list">
	        {this.props.results.map(function(result) {
    	      return <GroupMenuItem key={result.name} data={result} options={that.props.options}/>;
        	})}
			</ul>
		);
	},
	fromUrl: function(url, node, options) {
		$.getJSON(url, function(data){
			ReactDOM.render(
			  <GroupMenu results={data} options={options}/>,
			  node
			);
		})
	}
})

var renderMenu = {
	lights: function(options){
		var menu = new LightMenu()
		menu.fromUrl('/hue/lights', document.getElementById('hue-menu'), options)
	},
	groups: function(options){
		var menu = new GroupMenu()
		menu.fromUrl('/hue/groups', document.getElementById('hue-menu'), options)
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

	$(options.menuItems).on('click', function(){
		info.log('menu control')
		var menuType = $(this).attr('data-type');
		debug.log(menuType)
		$(options.menuArea).html("");
		$(options.controlArea).html("");
		renderMenu[menuType](options[menuType])
	})
});
