
function generateYearData(nbaData, allAreas, mapUnit, displayYear, cumulative) {
    nbaYearAreaData = {}

    Object.keys(nbaData[mapUnit]).forEach(function(areaName) {
        nbaYearAreaData[areaName] = nbaData[mapUnit][areaName].filter(function(d) {
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
        if (d == 'United States of America') {
            // pass
        }
        else if (nbaYearAreaData[d]) {

            areaData.push( {
                'area': d,
                'players': nbaYearAreaData[d],
                'num_players': nbaYearAreaData[d].length,
                'num_all_stars': nbaYearAreaData[d].filter(function(player) {
                                    return player.all_star_appearances > 0;
                                }).length
            })
        }
        else {
            var num_players = 0;
            var num_all_stars = 0;

            areaData.push({
                'area': d,
                'players': [],
                'num_players': num_players,
                'num_all_stars': num_all_stars
            });
        }
    })

    return areaData;
}