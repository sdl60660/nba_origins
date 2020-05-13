
var format = d3.format(",");
var nbaData;

// Set tooltips
var tip = d3.tip()
            .attr('class', 'd3-tip')
            .offset([-10, 0])
            .html(function(d) {
                if(nbaData.countries[d.properties.name]) {
                    var playerCount = nbaData.countries[d.properties.name].length;
                }
                else {
                    var playerCount = 0;
                }

              return "<strong>Country: </strong><span class='details'>" + d.properties.name + "<br></span>" + 
              "<strong>Number of NBA Players: </strong><span class='details'>" + playerCount
              +"</span>";
            })

var margin = {top: 0, right: 0, bottom: 0, left: 0},
            width = 960 - margin.left - margin.right,
            height = 500 - margin.top - margin.bottom;


// var logScale = d3.scaleLog()
//       .domain([1, 1000])
// var color = d3.scaleSequential(
//         (d) => d3.interpolateOranges(logScale(d))
//       )

var color = d3.scaleLog()
  .domain([0, 1000])
  .range(['white', 'orange']);

// var color = d3.scaleSequential(
//         d3.interpolateReds
//       )

color.domain([1, 1000])

// var color = d3.scaleLog()
//     .domain([1, 1000])
//     .range(d3.interpolateOranges);

var path = d3.geoPath();

var svg = d3.select("#world-map")
            .append("svg")
            .attr("width", width)
            .attr("height", height)
            .append('g')
            .attr('class', 'map');

var projection =  d3.geoMercator()
                    .scale(130)
                    .translate( [width / 2, height / 1.5]);

var path = d3.geoPath().projection(projection);

svg.call(tip);


var promises = [
  d3.json("static/data/processed_data.json"),
  d3.json("static/data/countries.json")
];

Promise.all(promises).then(function(allData) {
  nbaData = allData[0][73];
  var countries = allData[1];
  console.log(nbaData);
  console.log(countries);

  svg.append("g")
      .attr("class", "countries")
    .selectAll("path")
      .data(countries.features)
    .enter().append("path")
      .attr("d", path)
      .style("fill", function(d) {
            // console.log(nbaData.countries);
            if(typeof nbaData.countries[d.properties.name] !== "undefined") {
                console.log(nbaData.countries[d.properties.name].length);
                return color(nbaData.countries[d.properties.name].length);
            }
            else{
                return "white";
            }
            
        })
      .style('stroke', 'black')
      .style('stroke-width', 1.5)
      .style("opacity",0.8)
      // tooltips
        .style("stroke","black")
        .style('stroke-width', 0.3)
        .on('mouseover',function(d){
          tip.show(d);

          d3.select(this)
            .style("opacity", 1)
            .style("stroke","black")
            .style("stroke-width",3);
        })
        .on('mouseout', function(d){
          tip.hide(d);

          d3.select(this)
            .style("opacity", 0.8)
            .style("stroke","black")
            .style("stroke-width",0.3);
        });

  svg.append("path")
      .datum(topojson.mesh(countries.features, function(a, b) { return a.id !== b.id; }))
       // .datum(topojson.mesh(data.features, function(a, b) { return a !== b; }))
      .attr("class", "names")
      .attr("d", path);
});
