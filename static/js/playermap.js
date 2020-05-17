
PlayerMap = function(_parentElement, _projection, _geoJSON, _mapUnit, _dimensions) {

    this.parentElement = _parentElement;
    this.projection = _projection;
    this.geoJSON = _geoJSON;
    this.mapUnit = _mapUnit;
    this.dimensions = _dimensions;

    this.initVis();
}


PlayerMap.prototype.initVis = function() {
    var vis = this;

    vis.margin = {top: 30, right: 0, bottom: 20, left: 0};
    vis.width = vis.dimensions[0] - vis.margin.left - vis.margin.right;
    vis.height = vis.dimensions[1] - vis.margin.top - vis.margin.bottom;


    vis.projection
        .translate([vis.width / 2, vis.height / 2])

    if (vis.mapUnit == 'countries') {
        vis.projection
            .fitExtent([[0.5, 0.5], [vis.width - 0.5, vis.height - 0.5]], {type: "Sphere"})
    }

    vis.color = d3.scaleLog()
        .range(['#FFE4B2', 'orange']);

    vis.path = d3.geoPath();

    vis.svg = d3.select(vis.parentElement)
                .append("svg")
                .attr("width", vis.width)
                .attr("height", vis.height)
                .append('g')
                .attr('class', 'map');

    vis.path = d3.geoPath().projection(vis.projection);

    vis.allAreas = vis.geoJSON.features.map(function(d) {
            return d.properties;
        });

    vis.nbaYearDataArray = generateYearData(nbaData, vis.allAreas, vis.mapUnit, displayYear, cumulativeStatus);
    vis.nbaYearData = {};
    for (var i = 0; i < vis.nbaYearDataArray.length; i++) {
        vis.nbaYearData[vis.nbaYearDataArray[i].area] = vis.nbaYearDataArray[i];
    }
    // Set tooltips
    vis.tip = d3.tip()
        .attr('class', 'd3-tip')
        // .attr('id', function(d) {
        //     return d.properties.name + '-tooltip';
        // })
        // .attr("viewBox", "0,0,350,30")
        .offset([-10, 0])
        .html(function(d) {
            var areaName = d.properties.name;

            if(vis.nbaYearData[areaName]) {
                var playerCount = vis.nbaYearData[areaName]['num_players'];
                var allStarCount = vis.nbaYearData[areaName]['num_all_stars'];
                // var playerInfo = '<br><br>' + vis.nbaYearData[areaName]['players'];
            }
            else {
                var playerCount = 0;
                var allStarCount = 0;
                var playerInfo = '';
            }

            if(vis.mapUnit == 'countries') {
                var tipUnit = 'Country';
            }
            else {
                var tipUnit = 'State';
            }
            // var tipText = '<div id="' + d.properties.name.replace(' ', '-') + '-info-box">';
            var tipText = "<strong>" + tipUnit + ": </strong><span class='details'>" + areaName + "<br></span>";
            tipText += "<strong>NBA Players: </strong><span class='details'>" + playerCount + "<br></span>";
            tipText += "<strong>All-Stars: </strong><span class='details'>" + allStarCount + "</span>";
            tipText += "<br><br><span class='details'>(click region for full player list)</span>";
            // tipText += "</div>"
            // tipText += playerInfo;


            return tipText;
        })

    vis.svg.call(vis.tip);

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
                .attr("class", function(d) {
                    return d.properties.name.replace(/ /g, '-');
                })
                .attr("default-stroke", 0.3)
                .style("opacity", 0.8)
                // tooltips
                .style("stroke","black")
                .style('stroke-width', 0.3)
                .on('mouseover',function(d){
                    vis.tip.show(d);

                    d3.selectAll('.' + this.getAttribute('class'))
                        .style("opacity", 1)
                        .style("stroke","black")
                        .style("stroke-width", 3);
                })
                .on('mouseout', function(d){
                    vis.tip.hide(d);

                    d3.selectAll('.' + this.getAttribute('class'))
                        .style("opacity", 0.8)
                        .style("stroke","black")
                        .style("stroke-width", function(e, i, n) {
                            return n[i].getAttribute('default-stroke')
                        });
                })
                .on('click', function(d) {
                    $(('#player-info-text')).html(function() {
                        areaData = d3.map(nbaData[vis.mapUnit], function(d) { return d.key; })
                            .get(d.properties.name)['values'];

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
                            if (vis.mapUnit == 'hs_states') {
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

                        var infoText = '<strong style="margin-left: 20px">All-Stars (' + numAllStars + ')</strong><br><ul class="player_list">' + playerList.slice(0, numAllStars).join('') + '</ul><br>';
                        infoText += '<strong style="margin-left: 20px">Others (' + (playerList.length - numAllStars) + ')</strong><br><ul class="player_list">' + playerList.slice(numAllStars).join('') + '</ul>'

                        return infoText;
                    });
                })
                // .style("fill", "white")
                .style("fill", function(d) {
                    if(typeof vis.nbaYearData[d.properties.name] !== "undefined") {
                        // console.log(nbaYearData[vis.mapUnit][d.properties.name]);
                        return vis.color(vis.nbaYearData[d.properties.name][currentProperty]/populationData[vis.mapUnit][displayYear-1][d.properties.name]);
                    }
                    else {
                        return "white";
                    }
                
                });


    vis.wrangleData(vis.mapUnit);
}



PlayerMap.prototype.wrangleData = function(_mapUnit) {
    var vis = this;

    vis.mapUnit = _mapUnit;

    vis.nbaYearDataArray = generateYearData(nbaData, vis.allAreas, vis.mapUnit, displayYear, cumulativeStatus);
    vis.nbaYearData = {};
    for (var i = 0; i < vis.nbaYearDataArray.length; i++) {
        vis.nbaYearData[vis.nbaYearDataArray[i].area] = vis.nbaYearDataArray[i];
    }

    // color.domain([1, 1000])

    vis.updateVis();
}


PlayerMap.prototype.updateVis = function() {
    var vis = this;

    if (totalsPerCapita == "per_capita") {
        vis.color = d3.scaleLog()
            .domain(
                d3.extent(vis.geoJSON.features.filter(function(d){
                    return vis.nbaYearData[d.properties.name][currentProperty] > 0;
                }), function(d) {
                    return vis.nbaYearData[d.properties.name][currentProperty]/populationData[vis.mapUnit][displayYear-1][d.properties.name];
                }))
            .range(['#FFE4B2', '#FF3F00'])
    }
    else {
        vis.color = d3.scaleLog()
            .range(['#FFE4B2', 'orange']);
    }


    vis.svg.selectAll("path")
        .transition()
            .style("fill", function(d) {
                if (typeof populationData[vis.mapUnit][displayYear-1][d.properties.name] == "undefined") {
                    return "#DCDCDC"
                }
                else if(typeof vis.nbaYearData[d.properties.name] !== "undefined") {
                    if (totalsPerCapita == "per_capita") {
                        return vis.color(vis.nbaYearData[d.properties.name][currentProperty]/populationData[vis.mapUnit][displayYear-1][d.properties.name]);
                    }
                    else {
                        return vis.color(vis.nbaYearData[d.properties.name][currentProperty]);
                    }
                }
                else {
                    return "white";
                }
            
            });
                        
}

