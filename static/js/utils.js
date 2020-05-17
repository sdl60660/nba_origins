
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

function updateInfoText() {
    
    $(('#player-info-text')).html(function() {
        areaData = d3.map(nbaData[infoBoxMapUnit], function(infoBoxSelection) { return infoBoxSelection.key; })
            .get(infoBoxSelection.properties.name)['values'];

        playerList = areaData.filter(function(x) {
            if (cumulativeStatus == "active") {
                return x.start_year <= displayYear && x.end_year >= displayYear;
            }
            else {
                return x.start_year <= displayYear;
            }
        }).sort(function(a,b) {
            if(b.all_star_appearances - a.all_star_appearances == 0) {
                return b.career_ppg - a.career_ppg;
            }
            else {
                return b.all_star_appearances - a.all_star_appearances;
            }
        }).map(function(x) {
            if (infoBoxMapUnit == 'hs_states') {
                return '<li><a href="https://www.basketball-reference.com' + x.bbref_link + '">' + x.name + '</a> (' + x.high_school_name + ', ' + x.high_school_city + ')</li>';
            }
            else {
                return '<li><a href="https://www.basketball-reference.com' + x.bbref_link + '">' + x.name + '</a> (' + x.birth_city + ')</li>';
            }
        })

        var numAllStars = areaData.filter(function(x) {
            if (cumulativeStatus == "active") {
                return x.all_star_appearances > 0 && x.start_year <= displayYear && x.end_year >= displayYear;
            }
            else {
                return x.all_star_appearances > 0 && x.start_year <= displayYear;
            }
        }).length;

        var infoText = '<strong style="margin-left: 20px"><u>All-Stars (' + numAllStars + ')</u></strong><br><ul class="player_list">' + playerList.slice(0, numAllStars).join('') + '</ul><br>';
        infoText += '<strong style="margin-left: 20px"><u>Others (' + (playerList.length - numAllStars) + ')</u></strong><br><ul class="player_list">' + playerList.slice(numAllStars).join('') + '</ul>'

        return infoText;
    });
}