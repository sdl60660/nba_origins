
function generateYearData(nbaData, allAreas, mapUnit, displayYear, cumulative) {
    nbaYearAreaData = {}

    nbaData[mapUnit][birthPlaceHS].forEach(function(area) {
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

    if (phoneBrowsing == false) {
        var boxID = '#player-info-text'
    }
    else {
        var boxID = '#pop-up-player-info-text'
    }
    
    $(boxID).html(function() {

        var regionName = infoBoxMapUnit == 'cities' ? infoBoxSelection.city : infoBoxSelection.properties.name;

        try {
            if(infoBoxMapUnit == 'cities') {
                areaData = infoBoxSelection.player_list;
            }
            else {
                areaData = d3.map(nbaData[infoBoxMapUnit][birthPlaceHS], function(infoBoxSelection) { return infoBoxSelection.key; })
                    .get(infoBoxSelection.properties.name)['values'];
            }
        }
        catch {
            // If there are no players from a state (birthplace-wise or high school-wise, they won't show up in the data nest result)
            areaData = [];
        }

        selectedPlayers = areaData.filter(function(x) {
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

            var linkText = x.name;

            if (infoBoxMapUnit == 'cities') {
                var additionalText = '';
                if (x.high_school_name && birthPlaceHS == 'high_school') {
                    additionalText = ' (' + x.high_school_name + ')';
                }
            }
            else if (birthPlaceHS == 'high_school') {
                if (!x.high_school_name) {
                    var additionalText = '';
                }
                else if ($( window ).width() >= 1440) {
                    var additionalText = ' (' + x.high_school_name + ', ' + x.high_school_city + ')';
                }
                else {
                    var additionalText = ' (' + x.high_school_city + ')';
                }
            }
            else {
                var additionalText = ' (' + x.birth_city + ')';
            }

            if (phoneBrowsing == true) {
                return '<li>' + linkText + additionalText + '</li>';
            }
            else {
                return '<li><a href="https://www.basketball-reference.com' + x.bbref_link + '">' + linkText + '</a>' + additionalText + '</li>';
            }
        });


        var numAllStars = areaData.filter(function(x) {
            if (cumulativeStatus == "active") {
                return x.all_star_appearances > 0 && x.start_year <= displayYear && x.end_year >= displayYear;
            }
            else {
                return x.all_star_appearances > 0 && x.start_year <= displayYear;
            }
        }).length;

        var infoText = '';

        if (phoneBrowsing == false) {
            if (cumulativeStatus == 'active') {
                infoText += '<p style="text-align:center;background-color:#FFE4B2;"><strong style="margin-left: 20px;">' + regionName + ' (Active, ' + displayYear + ')</strong></p>';
            }
            else {
                infoText += '<p style="text-align:center;background-color:#FFE4B2;"><strong style="margin-left: 20px;">' + regionName + ' (' + (startYear-1) + '-' + displayYear + ')</strong></p>';

            }
        }

        infoText += '<strong style="margin-left: 20px;">All-Stars (' + numAllStars + ')</strong><ul class="player_list">' + selectedPlayers.slice(0, numAllStars).join('') + '</ul>';
        infoText += '<strong style="margin-left: 20px">Others (' + (selectedPlayers.length - numAllStars) + ')</strong><ul class="player_list">' + selectedPlayers.slice(numAllStars).join('') + '</ul>'

        return infoText;
    });
}