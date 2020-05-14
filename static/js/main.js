
// var format = d3.format(",");
var nbaData;
var countries;
var states;

var interval;

var displayYear = 1947;
const startYear = 1947;

var cumulativeStatus = "active";

var worldMapProjection = d3.geoEquirectangular()
    // .parallel(parallel)
    .precision(0.1)

var usProjection = d3.geoAlbersUsa()
    .scale([1000]);


$('.toggle-button')
    .on("click", function() {
        $('.toggle-button')
            .prop('disabled', false);

        $(this)
            .prop('disabled', true);

        cumulativeStatus = this.getAttribute('value');
        updateCharts();

        
    })
    

$('.enableOnInput').prop('disabled', true);


$("#slider-div").slider({
    max: 2020,
    min: startYear,
    step: 1,
    range: false,
    value: startYear,
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
    d3.json("static/data/full_player_data.json"),
    d3.json("static/data/countries.json"),
    d3.json("static/data/states.json")
];

Promise.all(promises).then(function(allData) {
    nbaData = allData[0];
    countries = allData[1];
    states = allData[2];

    stateMap = new PlayerMap("#us-map", usProjection, states, 'states');
    stateBarChart = new BarChart("#us-barchart", 'states', states, true);

    worldMap = new PlayerMap("#world-map", worldMapProjection, countries, 'countries');
    worldBarChart = new BarChart("#world-barchart", 'countries', countries, true);
});


