# NBA Origins

I scraped data from basketball-reference.com about NBA players' birthplaces and high schools and used this to construct two interactive maps, and an interactive chart with data about players' home states/countries/cities.

I attached a timeline feature to view data from previous seasons and a few other toggles to look at data per capita (using historical population data I gathered), filter down to only all-stars, look at cumulative or active totals, and switch between viewing players by birthplace or high school location.

I used:
* Python requests/beautiful soup to gather data
* Flask as a web server
* D3.js to build the visualizations
* Heroku to host the project

This project is live here: https://nba-origins.herokuapp.com/