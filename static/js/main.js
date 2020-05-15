
// var format = d3.format(",");
var nbaData;
var countries;
var states;

var interval;

var displayYear = 1982;
const startYear = 1947;

var cumulativeStatus = "active";
var currentProperty = "num_players";

var worldMapProjection = d3.geoEquirectangular()
    // .parallel(parallel)
    .precision(0.1)

var usProjection = geoAlbersUsaPR()
    .scale([1000]);


$('.active-cumulative-switch')
    .on("click", function() {
        $('.active-cumulative-switch')
            .prop('disabled', false);

        $(this)
            .prop('disabled', true)

        cumulativeStatus = this.getAttribute('value');
        updateCharts();

        
    });

$('.total-allstar-switch')
    .on("click", function() {
        $('.total-allstar-switch')
            .prop('disabled', false);

        $(this)
            .prop('disabled', true)

        currentProperty = this.getAttribute('value');
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
        $("#yearLabel").text(ui.value);

        displayYear = ui.value;
        updateCharts();
    }
})

$("#play-button")
    .on("click", function() {
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
    $("#yearLabel").text(displayYear);
    $("#slider-div").slider("value", displayYear);

    updateCharts();
}


function updateCharts() {
    stateMap.wrangleData();
    stateBarChart.wrangleData();

    worldMap.wrangleData();
    worldBarChart.wrangleData();
}


var promises = [
    d3.json("static/data/countries.json"),
    d3.json("static/data/states.json"),
    // d3.json("static/data/state_test.json"),
    d3.json("static/data/full_player_data.json")
];

Promise.all(promises).then(function(allData) {
    nbaData = allData[2];

    usPlayers = [];
    Object.keys(nbaData.states).forEach(function(d) {
        usPlayers = usPlayers.concat(nbaData.states[d]);
    })

    nbaData.countries['United States of America'] = usPlayers;

    countries = allData[0];
    states = allData[1];

    stateMap = new PlayerMap("#us-map", usProjection, states, 'states');
    stateBarChart = new BarChart("#us-barchart", 'states', states, true);

    worldMap = new PlayerMap("#world-map", worldMapProjection, countries, 'countries');
    worldBarChart = new BarChart("#world-barchart", 'countries', countries, true);
});


