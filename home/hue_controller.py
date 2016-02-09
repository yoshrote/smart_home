import logging
from phue import Group
from home.rgb_cie import Converter as ColorConverter
from valid_model import Object
from valid_model.descriptors import Integer, String, Float, Bool as Boolean, List, EmbeddedObject
log = logging.getLogger(__name__)

def _serialize_light(light):
	color_helper = ColorConverter()
	return {
		'light_id': light.light_id,
		'name': light.name,
		'on': light.on,
		'colormode': light.colormode,
		'brightness': light.brightness,
		'xy': light.xy,
		'effect': light.effect,
		'alert': None,
		'transitiontime': light.transitiontime,
		'color': '#'+color_helper.CIE1931ToHex(light.xy[0], light.xy[1], bri=light.brightness),
		# 'hue': light.hue,
		# 'saturation': light.saturation,
		# 'colortemp_k': light.colortemp_k,
	}

def _serialize_group(group):
	return {
		'group_id': group.group_id,
		'name': group.name,
		'on': group.on,
		'colormode': group.colormode,
		'brightness': group.brightness,
		'xy': group.xy,
		'effect': group.effect,
		'alert': None,
		'transitiontime': group.transitiontime,
		'lights': [_serialize_light(l) for l in group.lights]
		# 'hue': group.hue,
		# 'saturation': group.saturation,
		# 'colortemp_k': group.colortemp_k,
	}

class HueScenario(Object):
	scene_id = Integer(nullable=False)
	name = String(nullable=False)

class HueLight(Object):
	light_id = Integer(nullable=False)
	scene_id = Integer(nullable=False, default=0)
	name = String(nullable=False)
	on = Boolean(nullable=False)
	xy = List(value=Float(nullable=False))
	brightness = Float(nullable=False)
	effect = String()
	alert = Boolean(default=False)
	transitiontime = Integer()
	colormode = 'xy'

	@classmethod
	def from_api(cls, light):
		instance = cls(
			light_id=light.light_id,
			name=light.name,
			on=light.on,
			xy=light.xy,
			brightness=light.brightness,
			effect=light.effect,
			alert=light.alert == 'select',
			transitiontime=light.transitiontime,
		)
		return instance

	@classmethod
	def from_json(cls, json_body):
		return cls(
			group_id=json_body['light_id'],
			name=json_body['name'],
			on=json_body['on'],
			xy=json_body['xy'],
			brightness=json_body['brightness'],
			effect=json_body['effect'],
			alert=json_body['alert'],
			transitiontime=json_body['transitiontime']
		)

	@property
	def color(self):
		color_helper = ColorConverter()
		return color_helper.CIE1931ToHex(self.xy[0], self.xy[1], bri=self.brightness)

	def save(self, conn):
		self.validate()
		cursor = conn.cursor()
		cursor.execute("""
			INSERT OR REPLACE INTO lights
			(light_id, name, on, xy, brightness, effect, alert, transitiontime)
			VALUES
			(?, ?, ?, ?, ?, ?, ?, ?)
			""",
			self.light_id, self.name, self.on, self.xy, self.brightness,
			self.effect, 'select' if self.alert else None, self.transitiontime
		)

	@classmethod
	def load(cls, conn, light_id):
		cursor = conn.cursor()
		cursor.execute("SELECT * FROM lights WHERE light_id=?", light_id)
		light = cursor.fetchone()
		if light is None:
			return None
		else:
			return cls(
				light_id=cursor['light_id'],
				name=cursor['name'],
				on=cursor['on'],
				xy=cursor['xy'],
				brightness=cursor['brightness'],
				effect=cursor['effect'],
				alert=cursor['alert'] == 'select',
				transitiontime=cursor['transitiontime']
			)

	def create_tables(self, conn):
		conn.execute("""
			CREATE TABLE lights (
				light_id INTEGER PRIMARY KEY,
				name TEXT,
				on BOOL,
				x REAL,
				y REAL,
				brightness REAL,
				effect TEXT,
				alert TEXT,
				transitiontime INTEGER
			)
		""")

class HueGroup(Object):
	group_id = Integer(nullable=False)
	scene_id = Integer(nullable=False, default=0)
	name = String(nullable=False)
	on = Boolean(nullable=False)
	xy = List(value=Float(nullable=False))
	brightness = Float(nullable=False)
	effect = String()
	alert = String()
	transitiontime = Integer()
	lights = List(value=EmbeddedObject(HueLight()))

	@property
	def color(self):
		color_helper = ColorConverter()
		return color_helper.CIE1931ToHex(self.xy[0], self.xy[1], bri=self.brightness)

	def save(self, conn):
		self.validate()
		cursor = conn.cursor()
		cursor.execute("""
			INSERT OR REPLACE INTO groups
			(group_id, name, on, xy, brightness, effect, alert, transitiontime)
			VALUES
			(?, ?, ?, ?, ?, ?, ?, ?)
			""",
			self.group_id, self.name, self.on, self.xy, self.brightness,
			self.effect, self.alert, self.transitiontime
		)

	@classmethod
	def from_api(cls, group):
		instance = cls(
			group_id=group.group_id,
			name=group.name,
			on=group.on,
			xy=group.xy,
			brightness=group.brightness,
			effect=group.effect,
			alert=group.alert,
			transitiontime=group.transitiontime,
			lights=[HueLight.from_api(l) for l in group.lights]
		)
		return instance

	@classmethod
	def load(cls, conn, group_id):
		cursor = conn.cursor()
		cursor.execute("SELECT * FROM groups WHERE group_id=?", group_id)
		light = cursor.fetchone()
		if light is None:
			return None
		else:
			return cls(
				group_id=cursor['group_id'],
				name=cursor['name'],
				on=cursor['on'],
				xy=cursor['xy'],
				brightness=cursor['brightness'],
				effect=cursor['effect'],
				alert=cursor['alert'],
				transitiontime=cursor['transitiontime']
			)

	@classmethod
	def from_json(cls, json_body):
		return cls(
			group_id=json_body['group_id'],
			name=json_body['name'],
			on=json_body['on'],
			xy=json_body['xy'],
			brightness=json_body['brightness'],
			effect=json_body['effect'],
			alert=json_body['alert'],
			transitiontime=json_body['transitiontime']
		)

	def create_tables(self, conn):
		conn.execute("""
			CREATE TABLE groups (
				group_id INTEGER PRIMARY KEY,
				name TEXT,
				on BOOL,
				x REAL,
				y REAL,
				brightness REAL,
				effect TEXT,
				alert TEXT,
				transitiontime INTEGER
			)
		""")

class HueSceneResource(object):
	def __init__(self, conn):
		self.conn = conn

	def __getitem__(self, value):
		try:
			scene_id = int(value)
		except (TypeError, ValueError):
			scene_id = value

		return HueScenario.load(self.conn, scene_id)

	def all(self):
		return [{'id':l.scene_id, 'name':l.name} for l in HueScenario.load_all(self.conn)]

class HueLightResource(object):
	def __init__(self, lights):
		self.lights = lights

	def __getitem__(self, value):
		try:
			hue_id = int(value)
		except (TypeError, ValueError):
			hue_id = value

		return HueLight(
			light_id=hue_id,
			scene_id=0,
			name='top',
			on=True,
			xy=[1.2, 0.6],
			brightness=55.6,
			effect='colorloop',
			alert=False,
			transitiontime=None
		)
		return HueLight.from_api(self.lights[hue_id])

	def all(self):
		return [{'id':1, 'name': 'left'}, {'id':2, 'name': 'right'}]
		return [{'id':l.light_id, 'name':l.name} for l in self.lights.lights]

class HueGroupResource(object):
	def __init__(self, lights):
		self.lights = lights

	def __getitem__(self, value):
		try:
			return HueGroup.from_api(Group(self.lights, value))
		except LookupError:
			raise KeyError(value)

	def all(self):
		all_groups = []
		for group in self.lights.get_group():
			g = Group(self.lights, group)
			all_groups.append({'id':g.group_id, 'name': g.name})
		return all_groups

def get_hue_lights(request):
	return HueLightResource(request.phillips_hue)

def get_hue_groups(request):
	return HueGroupResource(request.phillips_hue)

def get_hue_scenes(request):
	return HueSceneResource(request.hue_db)

class HueLightController(object):
	def __init__(self, request):
		self.request = request

	def get_lights(self):
		return self.request.context.all()

	def get_light(self):
		return _serialize_light(self.request.context)

	def _cleanup_response(self, light_data):
		light_data['on'] = light_data['on']
		light_data['xy'] = ColorConverter().hexToCIE1931(light_data.pop('color').replace('#',''))
		light_data.pop('light_id')
		if not light_data['transitiontime']:
			light_data.pop('transitiontime')
		if light_data['alert'] == True:
			light_data['alert'] = 'select'
		else:
			light_data.pop('alert')
		return light_data

	def set_light(self):
		context = self.request.context
		light_data = self._cleanup_response(self.request.json_body)
		print light_data
		return
		for field, value in light_data.iteritems():
			if (field, value) == ('alert', 'select') or getattr(context, field) != value:
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

class HueSceneController(object):
	def __init__(self, request):
		self.request = request

	def create(self):
		pass

	def update(self):
		pass

	def delete(self):
		pass

	def get(self):
		pass

def includeme(config):
	from phue import Bridge
	bridge_addr = config.registry.settings['phillips_hue_bridge']
	config.registry['phillips_hue'] = None#Bridge(bridge_addr)
	# only uncomment for first run
	# config.registry['phillips_hue_bridge'].connect()
	config.add_request_method(
		lambda r: r.registry['phillips_hue'],
		'phillips_hue',
		property=True
	)

	import sqlite3
	sqlite_addr = config.registry.settings.get('phillips_hue_db', ':memory:')
	config.registry['phillips_hue_db'] = sqlite3.connect(sqlite_addr)
	config.add_request_method(
		lambda r: r.registry['phillips_hue_db'],
		'hue_db',
		property=True
	)

	config.add_route('lights_index', '/lights', factory=get_hue_lights)
	config.add_route('lights', '/lights/*traverse', factory=get_hue_lights)
	config.add_route('groups_index', '/groups', factory=get_hue_groups)
	config.add_route('groups', '/groups/*traverse', factory=get_hue_groups)
	config.add_route('scenes_index', '/scenes', factory=get_hue_scenes)
	config.add_route('scenes', '/scenes/*traverse', factory=get_hue_scenes)

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
