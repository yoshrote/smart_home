from pyramid.config import Configurator



def configure_sonos(config):
	import soco
	sonos = soco.discover()
	config.registry['sonos'] = sonos
	config.add_request_method(
		lambda r: r.registry['sonos'],
		'sonos',
		property=True
	)

def main(global_config, **settings):
	""" This function returns a Pyramid WSGI application.
	"""
	config = Configurator(settings=settings)
	# Discover smart devices
	config.include(configure_sonos)
	# config.include('home.nest_controller', route_prefix='nest')
	config.include('home.hue_controller', route_prefix='hue')

	config.include('pyramid_chameleon')
	config.add_static_view('static', 'static')#, cache_max_age=3600)
	config.add_route('home', '/')
	config.scan()
	return config.make_wsgi_app()
