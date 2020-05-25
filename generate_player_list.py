import json

country_name_translations = {
	'Russian Federation': 'Russia',
	'Islamic Republic of Iran': 'Iran',
	'Republic of Macedonia': 'Macedonia',
	'Republic of Korea': 'South Korea',
	'Serbia': 'Republic of Serbia'
}

known_city_issues = {
	'West Chicago CHS': 'Chicago',
	'Nles': 'Niles',
	'Albonito': 'Aibonito',
	'Carrolton': 'Carollton',
	'LaHabra': 'La Habra',
	'St. Monteverde': 'St. Montverde',
	'Worzbach': 'Wurzbach',
	'Harbin Manchuria': 'Harbin',
	'Cap-Haitian': 'Cap-Haitien',
	'LaCanada': 'La Canada',
	'Tolonto': 'Toronto',
	'Eleuthra': 'Eleuthera',
	'Juiz de Forz': 'Juiz de Fora',
	'Slavoska Požega': 'Požega',
	'Sainte-Catherine-les-Arras': 'Sainte-Catherine',
	'Cucq-Trepied-Stella-Plage': 'Cucq',
	'Osecola': 'Osceola',
	'Waldick': 'Waldwick',
	'Necaise Crossing': 'Necaise',
	'Loblesville': 'Lobelville',
	'Salemberg': 'Salemburg'
}

def generate_output_data(data):
	output_data = []

	players = list(data.values())

	for player in players:
		if player['birth_state'] or player['birth_location'] == 'Puerto Rico':
			player['birth_country'] = 'United States of America'
			player['birth_state'] = player['birth_location'].replace('\xa0', ' ')
		elif player['birth_location'].replace('\xa0', ' ') in country_name_translations.keys():
			player['birth_country'] = country_name_translations[player['birth_location'].replace('\xa0', ' ')]
		else:
			player['birth_country'] = player['birth_location'].replace('\xa0', ' ')

		if player['high_school_state'] or player['birth_state']:
			player['high_school_country'] = 'United States of America'
		else:
			player['high_school_country'] = player['birth_country']
			player['high_school_city'] = player['birth_city']

		for city_field in ['birth_city', 'high_school_city']:
			if player[city_field] in known_city_issues.keys():
				player[city_field] = known_city_issues[player[city_field]]

		if player['birth_city'] == 'N/A':
			player['full_birth_city'] = 'N/A'
		elif player['birth_state']:
			player['full_birth_city'] = '{}, {}, {}'.format(player['birth_city'], player['birth_state'], player['birth_country'])
		else:
			player['full_birth_city'] = '{}, {}'.format(player['birth_city'], player['birth_country'])


		if player['high_school_city'] == 'N/A':
			player['full_high_school_city'] = 'N/A'
		elif player['high_school_state']:
			player['full_high_school_city'] = '{}, {}, {}'.format(player['high_school_city'], player['high_school_state'], player['high_school_country'])
		else:
			player['full_high_school_city'] = '{}, {}'.format(player['high_school_city'], player['high_school_country'])


	return players

def main():
	with open('data/raw_player_data.json', 'r') as f:
		data = json.load(f)

	player_data = generate_output_data(data)

	with open('static/data/players_list.json', 'w') as f:
		json.dump(player_data, f)

if __name__ == "__main__":
	main()








