import json

with open('raw_data.json', 'r') as f:
	data = json.load(f)

for year_data in data:
	players = year_data['players']

	for player in players:
		if player['birth_state']:
			player['birth_country'] = 'United States of America'
			player['birth_state'] = player['birth_location'].replace('\xa0', ' ')
		else:
			player['birth_country'] = player['birth_location'].replace('\xa0', ' ')

	countries = list(set([x['birth_country'] for x in players]))
	states = list(set([x['birth_state'] for x in players if x['birth_state']]))

	year_data['countries'] = {}
	for country in countries:
		year_data['countries'][country] = list(filter(lambda x: x['birth_country'] == country, players))

	year_data['states'] = {}
	for state in states:
		year_data['states'][state] = list(filter(lambda x: x['birth_state'] == state, players))

	del year_data['players']

with open('processed_data.json', 'w') as f:
	json.dump(data, f)