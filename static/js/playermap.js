
PlayerMap = function(_parentElement, _projection, _geoJSON, _mapUnit) {

    this.parentElement = _parentElement;
    this.projection = _projection;
    this.geoJSON = _geoJSON;
    this.mapUnit = _mapUnit;

    this.initVis();
}


PlayerMap.prototype.initVis = function() {
    var vis = this;

    vis.margin = {top: 30, right: 0, bottom: 20, left: 0};
    vis.width = 760 - vis.margin.left - vis.margin.right;
    vis.height = 650 - vis.margin.top - vis.margin.bottom;


    vis.projection
        .translate([vis.width / 2, vis.height / 2])
        .fitExtent([[0.5, 0.5], [vis.width - 0.5, vis.height - 0.5]], {type: "Sphere"})


    vis.color = d3.scaleLog()
      .range(['white', 'orange']);

    vis.path = d3.geoPath();

    vis.svg = d3.select(vis.parentElement)
                .append("svg")
                .attr("width", vis.width)
                .attr("height", vis.height)
                .append('g')
                .attr('class', 'map');

    vis.path = d3.geoPath().projection(vis.projection);

    vis.tip = d3.tip()
        .attr('class', 'd3-tip')
        .offset([-10, 0])
        .html(function(d) {
            if(vis.nbaYearData[vis.mapUnit][d.properties.name]) {
                var playerCount = vis.nbaYearData[vis.mapUnit][d.properties.name].length;
            }
            else {
                var playerCount = 0;
            }

          var tipText = "<strong>Country: </strong><span class='details'>" + d.properties.name + "<br></span>"
          tipText += "<strong>Number of NBA Players: </strong><span class='details'>" + playerCount + "</span>";

          return tipText;
        })

    vis.svg.call(vis.tip);

    var nbaDataIndex = displayYear - startYear;
    vis.nbaYearData = nbaData[nbaDataIndex];

    // JOIN data with any existing elements
    vis.mapPath = vis.svg.append("g")
        .attr("class", vis.mapUnit)
        .selectAll("path")
        .data(vis.geoJSON.features, function(d) {
            return d.properties.name;
        })

    // EXIT old elements not present in new data (this shouldn't be the case)
    vis.mapPath
        .exit()
        .remove()

    // ENTER new elements present in the data...
    vis.mapPath
        .enter()
            .append("path")
                .attr("d", vis.path)
                .style('stroke', 'black')
                .style('stroke-width', 1.5)
                .style("opacity", 0.8)
                // tooltips
                .style("stroke","black")
                .style('stroke-width', 0.3)
                .on('mouseover',function(d){
                    vis.tip.show(d);

                    d3.select(this)
                        .style("opacity", 1)
                        .style("stroke","black")
                        .style("stroke-width",3);
                })
                .on('mouseout', function(d){
                    vis.tip.hide(d);

                    d3.select(this)
                        .style("opacity", 0.8)
                        .style("stroke","black")
                        .style("stroke-width",0.3);
                })
                // .style("fill", "white")
                .style("fill", function(d) {
                    // console.log(nbaData.countries);
                    if(typeof vis.nbaYearData[vis.mapUnit][d.properties.name] !== "undefined") {
                        // console.log(nbaYearData[vis.mapUnit][d.properties.name]);
                        return vis.color(vis.nbaYearData[vis.mapUnit][d.properties.name].length);
                    }
                    else {
                        return "white";
                    }
                
                });


    vis.wrangleData();
}



PlayerMap.prototype.wrangleData = function() {
    var vis = this;

    var nbaDataIndex = displayYear - startYear;
    vis.nbaYearData = nbaData[nbaDataIndex];

    // color.domain([1, 1000])

    vis.updateVis();
}


PlayerMap.prototype.updateVis = function() {
    var vis = this;

    // d3.selectAll("")
    vis.svg.selectAll("path")
        .transition()
            .style("fill", function(d) {
                // console.log(nbaData.countries);
                if(typeof vis.nbaYearData[vis.mapUnit][d.properties.name] !== "undefined") {
                    // console.log(nbaYearData[vis.mapUnit][d.properties.name]);
                    return vis.color(vis.nbaYearData[vis.mapUnit][d.properties.name].length);
                }
                else {
                    return "white";
                }
            
            });




    
                // .merge(vis.mapPath)
                    // .transition()
                        
}

