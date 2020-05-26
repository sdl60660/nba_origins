
// Initialize global variables
var nbaData;
var playerList;
var countries;
var states;
var populationData;
var cityCounts;

var interval;

var displayYear = 2020;
const startYear = 1947;

// Initialize toggle values
var cumulativeStatus = "active";
var currentProperty = "num_players";
var totalsPerCapita = "totals";
var birthPlaceHS = 'birth';


// Initialize info box data
var infoBoxActive = false;
var infoBoxSelection;
var infoBoxMapUnit;

var phoneBrowsing = false;

// Projections for player maps
var worldMapProjection = d3.geoNaturalEarth1()
var usProjection = geoAlbersUsaPR()
    // .scale([1000]);

// Function for nesting data into nbaData dictionary
var areaDivisionNest = function(key, playerList, map) {
    if (map == true) {
        return d3.nest()
                .key(function(d) { return d[key]; })
                .map(playerList.filter(function(d) {
                    return d[key] != null;
                }));
    }
    else {
        return d3.nest()
                .key(function(d) { return d[key]; })
                .entries(playerList.filter(function(d) {
                    return d[key] != null;
                }));
    }
}

// Determine if the user is browsing on mobile and adjust worldMapWidth if they are
if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
    phoneBrowsing = true;
    $('#info-box')
        .remove();
}

if (phoneBrowsing == true) {
    var worldMapWidth = 750;
}
else {
    var worldMapWidth = 900;
}


// Initialize timeline slider
$("#slider-div").slider({
    max: 2020,
    min: startYear,
    step: 1,
    range: false,
    value: displayYear,
    slide: function(event, ui) {
        $("#yearLabel").text((ui.value - 1) + '-' + (ui.value));

        displayYear = ui.value;
        updateCharts();
    }
})

$(".ui-slider-handle")
    .hide();

// Initialize timeline play button
$("#play-button")
    .on("tap click", function() {
        var button = $(this);

        if (button.text() == "▶") {
            button.text("❙ ❙");
            interval = setInterval(step, 500);
        }
        else {
            button.text("▶");
            clearInterval(interval);
        }
        
    });

// Set new variable values and update charts on toggle button change
$('.toggle-button')
    .on("tap click", function() {

        $('.' + $(this).attr("class").split(' ').slice(-1)[0])
            .prop('disabled', false)
            .css('font-weight', 'normal');

        $(this)
            .prop('disabled', true)
            .css('font-weight', 'bold');

        if($(this).hasClass('total-allstar-switch')) {
            currentProperty = this.getAttribute('value');
        }
        else if ($(this).hasClass('active-cumulative-switch')) {
            cumulativeStatus = this.getAttribute('value');
        }
        else if ($(this).hasClass('totals-per-capita-switch')) {
            totalsPerCapita = this.getAttribute('value');
        }
        else if ($(this).hasClass('birthplace-high-school-switch')) {
            if (infoBoxMapUnit) {
                infoBoxMapUnit = infoBoxMapUnit.replace(birthPlaceHS, this.getAttribute('value'));
            }
            birthPlaceHS = this.getAttribute('value');

        }

        updateCharts();

    });

$(".main-vis")
    .hide();

$("#us-map")
    .show();

d3.select("#search-val")
    .on("keyup", function() {
        cityBarChart.wrangleData();
    })


// Resize timeline on window size/jquery ui slider size change
$(window)
    .resize(function() {
        timeline.updateDimensions();
    })

$('.enableOnInput')
    .prop('disabled', true);


function step() {
    console.log(displayYear);
    displayYear = displayYear == 2020 ? startYear : displayYear + 1;
    $("#yearLabel").text((displayYear - 1) + '-' + (displayYear));
    $("#slider-div").slider("value", displayYear);

    updateCharts();
}


function updateCharts() {
    stateMap.wrangleData();
    worldMap.wrangleData();
    cityBarChart.wrangleData();

    if (infoBoxActive == true) {
        updateInfoText();
    }
}


var promises = [
    d3.json("static/data/test_countries.json"),
    d3.json("static/data/states.json"),

    d3.json("static/data/players_list.json"),

    d3.json("static/data/country_populations.json"),
    d3.json("static/data/state_populations.json"),
    d3.json("static/data/city_populations.json")
];

Promise.all(promises).then(function(allData) {

    $('.loading-spinner')
        .remove();
    

    // Remove country name from all cities in the US
    allData[2].forEach(function(d) {
        d.full_birth_city = d.full_birth_city.replace(', United States of America', '')
        d.full_high_school_city = d.full_high_school_city.replace(', United States of America', '')
    })
    playerList = allData[2];

    for (city in allData[5]) {
        allData[5][city]['city'] = allData[5][city]['city'].replace(', United States of America', '');
    }


    nbaData = {
        'countries': {
            'birth': areaDivisionNest('birth_country', playerList, false),
            'high_school': areaDivisionNest('high_school_country', playerList, false)
        },
        'states': {
            'birth': areaDivisionNest('birth_state', playerList, false),
            'high_school': areaDivisionNest('high_school_state', playerList, false)
        },
        'cities': {
            'birth': areaDivisionNest('full_birth_city', playerList, true),
            'high_school': areaDivisionNest('full_high_school_city', playerList, true)
        }
    };

    populationData = {
        'countries': allData[3],
        'states': allData[4],
        'cities': allData[5]
    }

    countriesTopoJSON = allData[0];
    statesTopoJSON = allData[1];

    // Initialize D3 elements (timeline, maps, bar chart)
    timeline = new Timeline("#slider-div");

    stateMap = new PlayerMap("#us-map", usProjection, statesTopoJSON, 'states', [750, 550]);
    worldMap = new PlayerMap("#world-map", worldMapProjection, countriesTopoJSON, 'countries', [worldMapWidth, 550]);
    cityBarChart = new BarChart("#city-chart");


    $(".us-map-icon")
        .css('opacity', 1.0)
        .css('background-color', "#FFE4B2");

    $("#city-search")
        .css('visibility', 'visible');

    $(".ui-slider-handle")
        .show();

    $(".vis-select")
        .on("tap click", function() {

            var elementID = $(this).attr('value');

            $(".main-vis")
                .hide();

            $(("#" + elementID))
                .show();

            $(".fas")
                .css('opacity', 0.7)
                .css('background-color', 'transparent');

            $(this)
                .css('opacity', 1.0)
                .css('background-color', "#FFE4B2");

        })

});


