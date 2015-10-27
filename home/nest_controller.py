class NestController(object):
	def __init__(self, request):
		self.nest = self.request.nest

	def get_status(self):
		self.nest.get_status()
		return self.nest.show_status()

	def show_status(self):
		return self.nest.show_status()

	def show_curtemp(self):
		return float(self.nest.show_curtemp())

	def show_target(self):
		return float(self.nest.show_target())

	def show_curmode(self):
		return self.nest.show_curmode()

	def set_temperature(self):
		temp = self.request.json_body['temp']
		return self.nest.set_temperature(temp)

	def set_fan(self):
		state = self.request.json_body['state']
		return self.nest.set_fan(state)

	def set_mode(self):
		state = self.request.json_body['state']
		return self.nest.set_mode(state)

	def toggle_away(self):
		return self.nest.toggle_away()

def includeme(config):
	from nest_thermostat import Nest
	n = Nest(
		config.registry.settings['nest.username'],
		config.registry.settings['nest.password'],
		config.registry.settings.get('nest.serial', None),
		config.registry.settings.get('nest.index', 0),
		units=config.registry.settings.get('nest.units', "F"),
	)
	n.login()
	n.get_status()
	config.registry['nest_thermostat'] = n
	config.add_request_method(
		lambda r: r.registry['nest_thermostat'],
		'nest_thermostat',
		property=True
	)

	config.add_route('nest' '/*traverse')
	# Status
	config.add_view(
		route_name='nest',
		name='',
		view=NestController,
		attr='show_status',
		request_method='GET',
	)
	config.add_view(
		route_name='nest',
		name='status',
		view=NestController,
		attr='show_status',
		request_method='GET',
	)
	config.add_view(
		route_name='nest',
		name='status',
		view=NestController,
		attr='get_status',
		request_method='POST',
	)
	# Temperature
	config.add_view(
		route_name='nest',
		name='temp',
		view=NestController,
		attr='show_curtemp',
		request_method='GET',
	)
	config.add_view(
		route_name='nest',
		name='target',
		view=NestController,
		attr='show_target',
		request_method='GET',
	)
	config.add_view(
		route_name='nest',
		name='target',
		view=NestController,
		attr='set_temperature',
		request_method='POST',
	)
	# Fan
	config.add_view(
		route_name='nest',
		name='fan',
		view=NestController,
		attr='set_fan',
		request_method='POST',
	)
	# Mode
	config.add_view(
		route_name='nest',
		name='mode',
		view=NestController,
		attr='set_mode',
		request_method='POST',
	)
	# Toggle Away
	config.add_view(
		route_name='nest',
		name='away',
		view=NestController,
		attr='toggle_away',
		request_method='POST',
	)
