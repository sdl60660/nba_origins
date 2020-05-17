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

	return players

def main():
	with open('data/raw_player_data.json', 'r') as f:
		data = json.load(f)

	player_data = generate_output_data(data)

	with open('static/data/players_list.json', 'w') as f:
		json.dump(player_data, f)

if __name__ == "__main__":
	main()








