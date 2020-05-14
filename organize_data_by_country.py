import json


def summarize_data(player_list, area_name):
	num_players = len(player_list)
	sorted_players = sorted(player_list, key=lambda x: x['career_ppg'], reverse=True)

	extra_text = ''
	if num_players < 5:
		sorted_players = sorted_players
	elif num_players == 5:
		sorted_players = sorted_players[:5]
	else:
		sorted_players = sorted_players[:5]
		extra_text = ' and ' + str(num_players - 5) + ' others'

	player_names = [x['name'] for x in sorted_players]
	player_links = ['https://www.basketball-reference.com' + x['bbref_link'] for x in sorted_players]

	player_sample_string = "<strong>Players: </strong><span class='details'>"
	for i, player in enumerate(player_names):
		player_sample_string += '<a href="' + player_links[i] + '">' + player_names[i] + '</a>'
		if i != len(player_names)-1:
			player_sample_string += ', '
	player_sample_string += extra_text + '</span>'

	return {
		'num_players': num_players,
		'area': area_name,
		'players': player_sample_string
	}


def flatten_data(input_data):
	for year in input_data:
		for country_name, country_data in year['countries'].items():
			year['countries'][country_name] = summarize_data(country_data, country_name)

		for state_name, state_data in year['states'].items():
			year['states'][state_name] = summarize_data(state_data, state_name)

	return input_data


def cumulative_players_list(year_data, data, index):
	players = []
	player_ids = []

	for year in data[:index]:
		new_players = [x for x in year['players'] if x['bbref_id'] not in player_ids]
		player_ids += [x['bbref_id'] for x in new_players]

		players += new_players

	players += [x for x in year_data['players'] if x['bbref_id'] not in player_ids]
	return players


def generate_output_data(data, cumulative=False):
	output_data = []

	for i, year_data in enumerate(data):
		out_year_data = {}

		if cumulative == True:
			players = cumulative_players_list(year_data, data, i)

		else:
			players = year_data['players']

		print(len(players))

		for player in players:
			if player['birth_state']:
				player['birth_country'] = 'United States of America'
				player['birth_state'] = player['birth_location'].replace('\xa0', ' ')
			else:
				player['birth_country'] = player['birth_location'].replace('\xa0', ' ')

		countries = list(set([x['birth_country'] for x in players]))
		states = list(set([x['birth_state'] for x in players if x['birth_state']]))

		out_year_data['countries'] = {}
		for country in countries:
			out_year_data['countries'][country] = list(filter(lambda x: x['birth_country'] == country, players))

		out_year_data['states'] = {}
		for state in states:
			out_year_data['states'][state] = list(filter(lambda x: x['birth_state'] == state, players))

		out_year_data['year'] = year_data['year']
		output_data.append(out_year_data)

	return output_data

def main():
	with open('data/raw_data.json', 'r') as f:
		data = json.load(f)


	active_data = generate_output_data(data, cumulative=False)
	cumulative_data = generate_output_data(data, cumulative=True)

	active_data = flatten_data(active_data)
	cumulative_data = flatten_data(cumulative_data)

	data = {
		'active': active_data,
		'cumulative': cumulative_data
		}

	with open('data/processed_data.json', 'w') as f:
		json.dump(data, f)


if __name__ == "__main__":
	main()








