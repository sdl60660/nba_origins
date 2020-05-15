#!/usr/bin/env python3

import requests
from bs4 import BeautifulSoup

import urllib.parse as urlparse
from urllib.parse import parse_qs

import json

import aiohttp
import asyncio


def get_all_stars():
	all_stars = {}

	r = requests.get('https://www.basketball-reference.com/awards/all_star_by_player.html')
	soup = BeautifulSoup(r.text, 'html.parser')

	table_rows = soup.find('tbody').findAll('tr')
	for row in table_rows:
		cols = row.findAll('td')
		player_id = cols[1].find('a')['href'].split('/')[-1].replace('.html', '')
		all_star_selections = cols[2].text

		all_stars[player_id] = all_star_selections

	return all_stars


def process_location(location_link, location_name, data, all_star_dict):
	print(location_name)

	full_link = 'https://www.basketball-reference.com/' + location_link
	parsed_params = parse_qs(urlparse.urlparse(full_link).query)
	country = parsed_params['country'][0]

	try:
		state = parsed_params['state'][0]
	except KeyError:
		state = None

	r = requests.get(full_link)
	soup = BeautifulSoup(r.text, 'html.parser')

	player_rows = soup.find('table', attrs={'class': 'stats_table'}).find('tbody').findAll('tr', class_=lambda x: x != 'thead')

	for row in player_rows:
		player = row.find('td', attrs={'data-stat': 'player'})

		player_link = player.find('a')['href']
		player_name = player.find('a').text
		player_id = player['data-append-csv']
		career_ppg = row.find('td', attrs={'data-stat': 'pts_per_g'}).text

		start_year = int(row.find('td', attrs={'data-stat': 'year_min'}).text)
		end_year = int(row.find('td', attrs={'data-stat': 'year_max'}).text)

		birth_city = row.find('td', attrs={'data-stat': 'birth_city'}).text

		if len(career_ppg) > 0:
			career_ppg = float(career_ppg)
		else:
			career_ppg = 0.0

		try:
			all_star_appearances = int(all_star_dict[player_id])
		except KeyError:
			all_star_appearances = 0

		data[player_id] = {
			'name': player_name,
			'bbref_link': player_link,
			'bbref_id': player_id,
			'career_ppg': career_ppg,
			'birth_location': location_name,
			'birth_country': country,
			'birth_state': state,
			'birth_city': birth_city,
			'start_year': start_year,
			'end_year': end_year,
			'all_star_appearances': all_star_appearances
		}

	return data


all_star_dict = get_all_stars()
player_birthplaces = {}

r = requests.get('https://www.basketball-reference.com/friv/birthplaces.fcgi')
soup = BeautifulSoup(r.text, 'html.parser')
wrappers = soup.find('div', attrs={'class': 'data_grid_group'}).findAll('p')

for wrapper in wrappers[2:]:
	link = wrapper.find('a')
	player_birthplaces = process_location(link['href'], link.text, player_birthplaces, all_star_dict)


with open('data/raw_player_data.json', 'w') as f:
	json.dump(player_birthplaces, f)
