import json
import requests
import urllib.parse

from collections import Counter


with open('static/data/players_list.json', 'r') as f:
	data = json.load(f)

birth_city_counts = Counter(['{}, {}, {}'.format(x['birth_city'], x['birth_state'], x['birth_country']) if x['birth_state'] else '{}, {}'.format(x['birth_city'], x['birth_country']) for x in data if x['birth_city'] != 'N/A'])
hs_city_counts = Counter(['{}, {}, United States of America'.format(x['high_school_city'], x['high_school_state']) for x in data if x['high_school_city'] != 'N/A'])

threshold = 1
birth_city_counts = {k: v for k,v in birth_city_counts.items() if v >= threshold}
hs_city_counts = {k: v for k,v in hs_city_counts.items() if v >= threshold}

username = "samlearner"
base_request = "http://api.geonames.org/searchJSON?formatted=true&q={}&maxRows=10&lang=es&username={}&style=full"

filenames = ['birth_city_counts', 'high_school_city_counts']
for i, datalist in enumerate([birth_city_counts, hs_city_counts]):
	out_data = []

	for key, value in datalist.items():
		if 'Republic of Serbia' in key:
			place_name = key.replace('Republic of Serbia', 'Serbia')
		else:
			place_name = key

		url = base_request.format(urllib.parse.quote(place_name), username)
		r = requests.get(url)

		try:
			population = r.json()['geonames'][0]['population']
			# player_density = 1.0*value/population
		except:
			population = None
			# player_density = None
		print(key, population)

		out_data.append({
			'city': key,
			# 'nba_players': value,
			# 'player_density': player_density,
			'population': population,
			'country': key.split(', ')[-1]
			})

	with open('static/data/{}.json'.format(filenames[i]), 'w') as f:
		json.dump(out_data, f)

