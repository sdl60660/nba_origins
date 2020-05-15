import json

country_name_translations = {
	'Russian Federation': 'Russia',
	'Islamic Republic of Iran': 'Iran',
	'Republic of Macedonia': 'Macedonia',
	'Republic of Korea': 'South Korea',
	'Serbia': 'Republic of Serbia'
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

	countries = list(set([x['birth_country'] for x in players]))
	states = list(set([x['birth_state'] for x in players if x['birth_state']]))

	output_data = {
		'countries': {},
		'states': {}
		}

	countries = list(set([x['birth_country'] for x in players]))
	states = list(set([x['birth_state'] for x in players if x['birth_state']]))

	for country in countries:
		if country != 'United States of America':
			output_data['countries'][country] = list(filter(lambda x: x['birth_country'] == country, players))
	output_data['countries']['Puerto Rico'] = list(filter(lambda x: x['birth_state'] == 'Puerto Rico', players))

	for state in states:
		output_data['states'][state] = list(filter(lambda x: x['birth_state'] == state, players))

	for region_type in output_data.values():
		for region_name, region in region_type.items():
			for player in region:
				try:
					del player['birth_country']
					del player['birth_state']
					del player['birth_location']
				except KeyError:
					pass

	return output_data

def main():
	with open('data/raw_player_data.json', 'r') as f:
		data = json.load(f)

	player_data = generate_output_data(data)

	with open('data/processed_data.json', 'w') as f:
		json.dump(player_data, f)


if __name__ == "__main__":
	main()








