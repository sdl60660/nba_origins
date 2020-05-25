import json
import requests
import urllib.parse

from collections import Counter


def get_city_info(key):
	if 'Republic of Serbia' in key:
		place_name = key.replace('Republic of Serbia', 'Serbia')
	else:
		place_name = key

	place_name = place_name.replace(' , ', ', ')

	url = base_request.format(urllib.parse.quote(place_name), username)
	r = requests.get(url)

	try:
		population = r.json()['geonames'][0]['population']
	except:
		population = None
	print(place_name, population)

	return {
		'city': key,
		'population': population,
		'country': key.split(', ')[-1]
		}


known_issues = {
	'West Chicago CHS': 'Chicago',
	'Nles': 'Niles'	
}


with open('static/data/players_list.json', 'r') as f:
	data = json.load(f)

birth_city_counts = Counter(['{}, {}, {}'.format(x['birth_city'], x['birth_state'], x['birth_country']) if x['birth_state'] else '{}, {}'.format(x['birth_city'], x['birth_country']) for x in data if x['birth_city'] != 'N/A'])
# hs_city_counts = Counter(['{}, {}, {}'.format(x['high_school_city'], x['high_school_state'], x['high_school_country']) for x in data if x['high_school_city'] != 'N/A'])
hs_city_vals = []
for x in data:
	if x['high_school_city'] != 'N/A':

		if x['high_school_state']:
			hs_city_vals.append('{}, {}, {}'.format(x['high_school_city'], x['high_school_state'], x['high_school_country']))
		else:
			hs_city_vals.append('{}, {}'.format(x['high_school_city'], x['high_school_country']))

hs_city_counts = Counter(hs_city_vals)


threshold = 1
birth_city_counts = {k: v for k,v in birth_city_counts.items() if v >= threshold}
hs_city_counts = {k: v for k,v in hs_city_counts.items() if v >= threshold}

username = "samlearner"
base_request = "http://api.geonames.org/searchJSON?formatted=true&q={}&maxRows=10&lang=es&username={}&style=full"

filenames = ['birth_city_counts', 'high_school_city_counts']
for i, datalist in enumerate([birth_city_counts, hs_city_counts]):

	with open('static/data/{}.json'.format(filenames[i]), 'r') as f:
		existing_data = {x['city']: x for x in json.load(f)}

	out_data = []

	for key, value in datalist.items():

		try:
			existing_entry = existing_data[key]
			if existing_entry['population'] == None:
				out_data.append(get_city_info(key))
			else:
				out_data.append(existing_entry)
		except KeyError:
			out_data.append(get_city_info(key))

	with open('static/data/{}.json'.format(filenames[i]), 'w') as f:
		json.dump(out_data, f)

