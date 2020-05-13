
// var format = d3.format(",");
var nbaData;
var countries;
var states;

var displayYear = 1957;
const startYear = 1947;


var worldMapProjection = d3.geoEquirectangular()
    // .parallel(parallel)
    .precision(0.1)

var usProjection = d3.geoAlbersUsa()
    .scale([1000]);


$("#slider-div").slider({
    max: 2020,
    min: 1947,
    step: 1,
    range: false,
    value: startYear,
    slide: function(event, ui) {
        $("#yearLabel").text(ui.value);

        displayYear = ui.value;
        updateCharts();
    }

})


function updateCharts() {
    stateMap.wrangleData();
    stateBarChart.wrangleData();

    worldMap.wrangleData();
    worldBarChart.wrangleData();
}


var promises = [
    d3.json("static/data/processed_data.json"),
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


