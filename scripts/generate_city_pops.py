import json
import requests
import os
import urllib.parse

from collections import Counter

username = "samlearner"
base_request = "http://api.geonames.org/searchJSON?formatted=true&q={}&maxRows=10&lang=es&username={}&style=full"


def generate_city_counts():
	with open('static/data/players_list.json', 'r') as f:
		player_list = json.load(f)

	city_counts = Counter([player['full_birth_city'] for player in player_list])
	for player in player_list:
		hs_city = player['full_high_school_city']
		if hs_city:
			city_counts[hs_city] = city_counts.get(hs_city, 0) + 1

	# Could apply a threshold here, based on count. As is, though, I want to feed through cities with even one player and filter on the front-end.
	# threshold = 1
	# city_counts = {k: v for k,v in city_counts.items() if v >= threshold}

	return city_counts


def get_existing_data():
	if os.path.exists('../static/data/city_populations.json'):
		with open('../static/data/city_populations.json', 'r') as f:
			return {x['city']: x for x in json.load(f)}
	else:
		return {}


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


def main():
	city_counts = generate_city_counts()
	existing_data = get_existing_data()

	out_data = []

	for key, value in city_counts.items():
		if key == 'N/A' or key == 'None, United States of America':
			continue

		try:
			existing_entry = existing_data[key]

			if existing_entry['population'] == None:
				out_data.append(get_city_info(key))
			else:
				out_data.append(existing_entry)

		except KeyError:
			out_data.append(get_city_info(key))

	with open('../static/data/city_populations.json', 'w') as f:
		json.dump(out_data, f)


if __name__ == "__main__":
	main()




