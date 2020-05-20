
// var format = d3.format(",");
var nbaData;
var playerList;
var countries;
var states;
var populationData;
var cityCounts;

var interval;

var displayYear = 1982;
const startYear = 1947;

var cumulativeStatus = "active";
var currentProperty = "num_players";
var totalsPerCapita = "totals";
var birthPlaceHS = 'high_school';

var infoBoxActive = false;
var infoBoxSelection;
var infoBoxMapUnit;

var phoneBrowsing = false;

var worldMapProjection = d3.geoEquirectangular()
    // .parallel(parallel)
    .precision(0.1)

var usProjection = geoAlbersUsaPR()
    // .scale([1000]);


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

$(".vis-select")
    .on("tap click", function() {

        var elementID = $(this).attr('value');

        $(".main-vis")
            .hide();

        $(("#" + elementID))
            .show();

    })

// Resize timeline on window size/jquery ui slider size change
$(window)
    .resize(function() {
        timeline.updateDimensions();
    })
    // .scroll(function() {
    //     if(window.scrollY >= 214) {

    //         $("#optional-spacer")
    //             .css("height", $("#selections").height());

    //         $("#selections")
    //             .css("position", "fixed")
    //             .css("top", 0)
    //             .css("left", 0)
    //     }
    //     else {
    //         $("#optional-spacer")
    //             .css("height", 0);

    //         $("#selections")
    //             .css("position", "relative")
    //             .css("top", null)
    //             .css("left", null)
    //     }
    // })
    

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
    stateMap.wrangleData((birthPlaceHS + '_states'));
    // stateBarChart.wrangleData();

    worldMap.wrangleData((birthPlaceHS + '_countries'));
    // worldBarChart.wrangleData();

    cityBarChart.wrangleData();

    // bubblePlot.wrangleData();
    if (infoBoxActive == true) {
        updateInfoText();
    }
}


var promises = [
    d3.json("static/data/countries.json"),
    d3.json("static/data/states.json"),
    // d3.json("static/data/state_test.json"),

    d3.json("static/data/players_list.json"),

    d3.json("static/data/country_populations.json"),
    d3.json("static/data/state_populations.json"),

    d3.json("static/data/high_school_city_counts.json"),
    d3.json("static/data/birth_city_counts.json")
];

Promise.all(promises).then(function(allData) {

    if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
        phoneBrowsing = true;
        $('#info-box')
            .remove();
    }

    $('.loading-spinner')
        .remove();

    playerList = allData[2];

    var areaDivisionNest = function(key) {
        return d3.nest()
            .key(function(d) { return d[key]; })
            .entries(allData[2].filter(function(d) {
                return d[key] != null;
            }));
    }

    nbaData = {
        'birth_countries': areaDivisionNest('birth_country'),
        'high_school_countries': areaDivisionNest('high_school_country'),
        'birth_states': areaDivisionNest('birth_state'),
        'high_school_states': areaDivisionNest('high_school_state')
    };

    populationData = {
        'birth_countries': allData[3],
        'high_school_countries': allData[3],
        'birth_states': allData[4],
        'high_school_states': allData[4]
    }

    cityCounts = {
        'high_school': allData[5],
        'birth': allData[6]
    }

    countries = allData[0];
    states = allData[1];

    stateMap = new PlayerMap("#us-map", usProjection, states, 'high_school_states', [750, 600]);
    // stateBarChart = new BarChart("#us-barchart", 'states', states, true);

    worldMap = new PlayerMap("#world-map", worldMapProjection, countries, 'high_school_countries', [800, 600]);
    // worldBarChart = new BarChart("#world-barchart", 'countries', countries, true);

    // bubblePlot = new BubblePlot("#us-pop-comparison-chart", 'states', states, [700, 650])

    timeline = new Timeline("#slider-div");

    cityBarChart = new BarChart("#city-chart");
});


