
// var format = d3.format(",");
var nbaData;
var countries;
var states;
var populationData;

var interval;

var displayYear = 1982;
const startYear = 1947;

var cumulativeStatus = "active";
var currentProperty = "num_players";
var totalsPerCapita = "totals";
var birthPlaceHS = 'hs_states';

var infoBoxActive = false;
var infoBoxSelection;
var infoBoxMapUnit;

var phoneBrowsing = false;

var worldMapProjection = d3.geoEquirectangular()
    // .parallel(parallel)
    .precision(0.1)

var usProjection = geoAlbersUsaPR()
    .scale([1000]);


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
            birthPlaceHS = infoBoxMapUnit = this.getAttribute('value');
        }

        updateCharts();

    });
    

$('.enableOnInput').prop('disabled', true);


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

function step() {
    console.log(displayYear);
    displayYear = displayYear == 2020 ? startYear : displayYear + 1;
    $("#yearLabel").text((displayYear - 1) + '-' + (displayYear));
    $("#slider-div").slider("value", displayYear);

    updateCharts();
}


function updateCharts() {
    stateMap.wrangleData(birthPlaceHS);
    // stateBarChart.wrangleData();

    worldMap.wrangleData('countries');
    // worldBarChart.wrangleData();

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
    d3.json("static/data/state_populations.json")
];

Promise.all(promises).then(function(allData) {

    if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
        phoneBrowsing = true;
    }

    $('.loading-spinner')
        .remove();

    var areaDivisionNest = function(key) {
        return d3.nest()
            .key(function(d) { return d[key]; })
            .entries(allData[2].filter(function(d) {
                return d[key] != null;
            }));
    }

    nbaData = {
        'countries': areaDivisionNest('birth_country'),
        'birth_states': areaDivisionNest('birth_state'),
        'hs_states': areaDivisionNest('high_school_state')
    };

    populationData = {
        'countries': allData[3],
        'birth_states': allData[4],
        'hs_states': allData[4]
    }

    countries = allData[0];
    states = allData[1];

    stateMap = new PlayerMap("#us-map", usProjection, states, 'hs_states', [750, 600]);
    // stateBarChart = new BarChart("#us-barchart", 'states', states, true);

    worldMap = new PlayerMap("#world-map", worldMapProjection, countries, 'countries', [1000, 750]);
    // worldBarChart = new BarChart("#world-barchart", 'countries', countries, true);

    // bubblePlot = new BubblePlot("#us-pop-comparison-chart", 'states', states, [700, 650])
});


