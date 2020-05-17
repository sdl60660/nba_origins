import requests
from bs4 import BeautifulSoup

import csv
import json

output_data = {}

for year in range(1946, 2020):
	print(year)

	output_data[year] = {}

	r = requests.get('https://fred.stlouisfed.org/release/tables?rid=118&eid=259194&od={}-01-01#'.format(year))
	soup = BeautifulSoup(r.text, 'html.parser')

	table_rows = soup.find('tbody').findAll('tr')
	for row in table_rows:
		state_name = row.find('span', attrs={'class': 'fred-rls-elm-nm'}).find('a').text
		state_pop = row.find('td', attrs={'class': 'fred-rls-elm-vl-td'}).text.replace(',', '').replace('.', '').replace('\n', '').replace(' ', '')

		if len(state_pop) > 0:
			output_data[year][state_name] = int(state_pop)


with open('data/pr_populations.csv', 'r', encoding='utf-8-sig') as f:
	data = sorted([x for x in csv.DictReader(f)], key=lambda x: x['Year'])

	for row in data:
		row['Year'] = int(row['Year'])
		row['Population'] = int(row['Population'].replace(',',''))

	for i, row in enumerate(data):

		if i == (len(data) - 1):
			# output_data[row['Year']]['Puerto Rico'] = row['Population']
			continue
		else:
			annual_growth = 1.0*(data[i+1]['Population'] - row['Population']) / (data[i+1]['Year'] - row['Year'])
			for middle_year in range(row['Year'], data[i+1]['Year']):
				if middle_year >= 1946:
					output_data[middle_year]['Puerto Rico'] = int(row['Population'] + (middle_year - row['Year'])*annual_growth)

with open('data/state_populations.json', 'w') as f:
	json.dump(output_data, f)





