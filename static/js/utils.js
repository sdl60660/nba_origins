
function generateYearData(nbaData, allAreas, mapUnit, displayYear, cumulative) {
    nbaYearAreaData = {}

    nbaData[mapUnit].forEach(function(area) {
        areaName = area.key;
        players = area.values;

        nbaYearAreaData[areaName] = players.filter(function(d) {
            if (cumulativeStatus == "cumulative") {
                return d.start_year <= displayYear;
            }
            else {
                return d.start_year <= displayYear && d.end_year >= displayYear;
            }   
        })
    })

    areaData = [];
    allAreas.forEach(function(d) {
        // if (d.name == 'United States of America') {
        //     // pass
        // }
        if (nbaYearAreaData[d.name]) {

            areaData.push( {
                'area': d.name,
                'players': nbaYearAreaData[d.name],
                'num_players': nbaYearAreaData[d.name].length,
                'num_all_stars': nbaYearAreaData[d.name].filter(function(player) {
                                    return player.all_star_appearances > 0;
                                }).length,
                'region': d.region
            })
        }
        else {
            var num_players = 0;
            var num_all_stars = 0;

            areaData.push({
                'area': d.name,
                'players': [],
                'num_players': num_players,
                'num_all_stars': num_all_stars,
                'region': d.region
            });
        }
    })

    return areaData;
}