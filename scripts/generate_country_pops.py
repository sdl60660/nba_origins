import json
import csv

with open('../raw_data/world_pops.csv', 'r', encoding='utf-8-sig') as f:
	data = [x for x in csv.DictReader(f)]
	out_data = {}
	for year in range(1946, 2020):
		out_data[str(year)] = {}

	for country in data:
		country_name = country['Country']

		explicit_years = [1945, 1950, 1955, 1960, 1965, 1970, 1975, 1980, 1985, 1990, 1995, 2000, 2005, 2010, 2015, 2020]
		for i, year in enumerate(explicit_years):
			if i == (len(explicit_years) - 1):
				continue
			else:
				start_pop = int(country[str(year)])
				end_pop = int(country[str(explicit_years[i+1])])

				annual_growth = 1.0 * (end_pop - start_pop) / (explicit_years[i+1] - year)

				for middle_year in range(year, explicit_years[i+1]):
					# print(middle_year)
					if middle_year >= 1946:
						out_data[str(middle_year)][country_name] = int(start_pop + annual_growth*(middle_year - year))

	with open('../static/data/country_populations.json', 'w') as f:
		json.dump(out_data, f)