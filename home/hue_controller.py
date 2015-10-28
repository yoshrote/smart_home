#TODO: Implement schedules
import logging
from phue import Group
from home.rgb_cie import Converter as ColorConverter
log = logging.getLogger(__name__)

def _serialize_light(light):
	color_helper = ColorConverter()
	return {
		'light_id': light.light_id,
		'name': light.name,
		'on': light.on,
		'colormode': light.colormode,
		'brightness': light.brightness,
		'hue': light.hue,
		'saturation': light.saturation,
		'xy': light.xy,
		'colortemp_k': light.colortemp_k,
		'effect': light.effect,
		'alert': light.alert,
		'transitiontime': light.transitiontime,
		'color': '#'+color_helper.CIE1931ToHex(light.xy[0], light.xy[1], bri=light.brightness),
	}

def _serialize_group(group):
	return {
		'group_id': group.group_id,
		'name': group.name,
		'on': group.on,
		'colormode': group.colormode,
		'brightness': group.brightness,
		'hue': group.hue,
		'saturation': group.saturation,
		'xy': group.xy,
		'colortemp_k': group.colortemp_k,
		'effect': group.effect,
		'alert': group.alert,
		'transitiontime': group.transitiontime,
		'lights': [_serialize_light(l) for l in group.lights]
	}

class HueLightResource(object):
	def __init__(self, lights):
		self.lights = lights

	def __getitem__(self, value):
		try:
			hue_id = int(value)
		except (TypeError, ValueError):
			hue_id = value

		return self.lights[hue_id]

	def all(self):
		return [(l.light_id, l.name) for l in self.lights.lights]

class HueGroupResource(object):
	def __init__(self, lights):
		self.lights = lights

	def __getitem__(self, value):
		try:
			return Group(self.lights, value)
		except LookupError:
			raise KeyError(value)

	def all(self):
		all_groups = []
		for group in self.lights.get_group():
			g = Group(self.lights, group)
			all_groups.append((g.group_id, g.name))
		return all_groups

def get_hue_lights(request):
	return HueLightResource(request.phillips_hue)

def get_hue_groups(request):
	return HueGroupResource(request.phillips_hue)

class HueLightController(object):
	const_fields = ['x', 'y', 'colormode', 'light_id', 'colortemp_k']
	def __init__(self, request):
		self.request = request

	def get_lights(self):
		return self.request.context.all()

	def get_light(self):
		return _serialize_light(self.request.context)

	def set_light(self):
		context = self.request.context
		light_data = self.request.json_body
		# print context
		# print light_data
		for field, value in light_data.iteritems():
			# print field, value
			if field == 'transitiontime' and value is None:
				continue
			elif field == 'color':
				context.xy = ColorConverter().hexToCIE1931(value.replace('#',''))
				continue
			elif field in self.const_fields:
				continue
			if field =='alert' or field in self.const_fields or getattr(context, field) != value:
				setattr(context, field, value)

class HueGroupController(object):
	const_fields = ['x', 'y', 'colormode', 'group_id', 'colortemp_k', 'lights']
	def __init__(self, request):
		self.request = request

	def get_groups(self):
		return self.request.context.all()

	def get_group(self):
		return _serialize_group(self.request.context)

	def set_group(self):
		context = self.request.context
		group_data = self.request.json_body
		for field, value in group_data.iteritems():
			# print field, value
			if field == 'transitiontime' and value is None:
				continue
			elif field == 'color':
				context.xy = ColorConverter().hexToCIE1931(value.replace('#',''))
				continue
			elif field in self.const_fields:
				continue
			if field =='alert' or field in self.const_fields or getattr(context, field) != value:
				setattr(context, field, value)

def includeme(config):
	from phue import Bridge
	bridge_addr = config.registry.settings['phillips_hue_bridge']
	config.registry['phillips_hue'] = Bridge(bridge_addr)
	# only uncomment for first run
	# config.registry['phillips_hue_bridge'].connect()
	config.add_request_method(
		lambda r: r.registry['phillips_hue'],
		'phillips_hue',
		property=True
	)

	config.add_route('lights_index', '/lights', factory=get_hue_lights)
	config.add_route('lights', '/lights/*traverse', factory=get_hue_lights)
	config.add_route('groups_index', '/groups', factory=get_hue_groups)
	config.add_route('groups', '/groups/*traverse', factory=get_hue_groups)

	config.add_view(
		route_name='lights_index',
		view=HueLightController,
		attr='get_lights',
		request_method='GET',
		renderer='json'
	)
	config.add_view(
		route_name='lights',
		view=HueLightController,
		attr='get_light',
		request_method='GET',
		renderer='json'
	)
	config.add_view(
		route_name='lights',
		view=HueLightController,
		attr='set_light',
		request_method='POST',
		renderer='json'
	)

	config.add_view(
		route_name='groups_index',
		view=HueGroupController,
		attr='get_groups',
		request_method='GET',
		renderer='json'
	)
	config.add_view(
		route_name='groups',
		view=HueGroupController,
		attr='get_group',
		request_method='GET',
		renderer='json'
	)
	config.add_view(
		route_name='groups',
		view=HueGroupController,
		attr='set_group',
		request_method='POST',
		renderer='json'
	)
