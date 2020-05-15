#!/usr/bin/env python3

import requests
from bs4 import BeautifulSoup

import urllib.parse as urlparse
from urllib.parse import parse_qs

import json
import math

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


def page_generator(start, stop):
    for page in range(start, stop+1):
        yield page


async def fetch(session, url):
    async with session.get(url) as r:
    	try:
    		return await r.json()
    	except:
    		print(r)
    		return None


async def process_location(location_link, location_name, data, all_star_dict):
	print(location_name)

	full_link = 'https://www.basketball-reference.com/' + location_link
	parsed_params = parse_qs(urlparse.urlparse(full_link).query)
	country = parsed_params['country'][0]

	try:
		state = parsed_params['state'][0]
	except KeyError:
		state = None

	async with aiohttp.ClientSession() as session:
		async with session.get(full_link) as resp:
			text = await resp.read()

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



async def main():
	num_processes = 10

	all_star_dict = get_all_stars()

	player_birthplaces = {}

	r = requests.get('https://www.basketball-reference.com/friv/birthplaces.fcgi')
	soup = BeautifulSoup(r.text, 'html.parser')
	wrappers = soup.find('div', attrs={'class': 'data_grid_group'}).findAll('p')
	iteratable_data = [x.find('a') for x in wrappers[2:]]

	base_locs = len(iteratable_data)
	loc_range = page_generator(1, base_locs)
	num_chunks = math.ceil(base_locs/num_processes)

	for chunk in range(num_chunks):
		tasks = []

		for process_num in range(num_processes):
			try:
				loc_num = next(loc_range)
				data_index = (chunk*num_processes) + process_num
				request = loop.create_task(process_location(iteratable_data[data_index]['href'], iteratable_data[data_index].text))
				tasks.append(request)
			except StopIteration:
				pass

		await asyncio.wait(tasks)

		for task in tasks:
			player_birthplaces.update(task.result())

	print(player_birthplaces)

if __name__ == "__main__":

    # try:
    loop = asyncio.get_event_loop()
    loop.run_until_complete(main())
    # except:
        # print('error')
    # finally:
	   #  loop.close()

    # print("%.2f" % (time.time() - start))


