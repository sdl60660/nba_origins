
PlayerMap = function(_parentElement, _projection, _topoJSON, _mapUnit, _dimensions) {

    this.parentElement = _parentElement;
    this.projection = _projection;
    this.topoJSON = _topoJSON;
    this.mapUnit = _mapUnit;
    this.dimensions = _dimensions;
    this.currentZoom = 1;

    this.setupComponents();
}


PlayerMap.prototype.setupComponents = function() {
    var vis = this;

    vis.width = vis.dimensions[0]
    vis.height = vis.dimensions[1]

    vis.svg = d3.select(vis.parentElement)
                .append("svg")

    vis.svg
        .attr("width", vis.width)
        .attr("height", vis.height)
        .attr("preserveAspectRatio", "xMinYMin meet")

    vis.g = vis.svg
        .append('g')
            .attr('class', 'map');

    vis.color = d3.scaleLog()
            .range(['#FFE4B2', 'orange']);

    // If this is a world map
    if (vis.mapUnit.indexOf('countries') != -1) {

        vis.projection
            .fitExtent([[0.5, 0.5], [vis.width, vis.height]], {type: "Sphere"})

        vis.projection
            .translate([(vis.width / 2.1), (vis.height / 2) + 15])

        const zoom = d3.zoom()
            .scaleExtent([1, 7])
            .on('zoom', zoomed);

        vis.svg.call(zoom);

        function zoomed() {
            vis.currentZoom = d3.event.transform.k;
            vis.svg
                .selectAll('path')
                .attr('transform', d3.event.transform);
        }

        vis.svg.append("text")
            .text("(scroll to zoom, click/drag to pan)")
            .attr("x", (vis.width / 2) - 20)
            .attr("y", 20)
            .attr("text-anchor", "middle")
            .attr("font-size", "9pt")
            .attr("opacity", 0.7);
    }

    else {
        vis.projection
            .translate([(vis.width / 2) + 10, (vis.height / 2) -55])
    }

    // Initialize path
    vis.path = d3.geoPath().projection(vis.projection);

    // Extract array of map features out of the topoJSON
    var trueMapUnit = vis.mapUnit.split('_').pop();
    vis.unpackedFeatures = topojson.feature(vis.topoJSON, vis.topoJSON.objects[trueMapUnit]);

    vis.allAreas = vis.unpackedFeatures.features.map(function(d) {
            return d.properties;
        });

    // Generate dataset for initializing the visualization
    vis.nbaYearDataArray = generateYearData(nbaData, vis.allAreas, vis.mapUnit, displayYear, cumulativeStatus);
    vis.nbaYearData = {};
    for (var i = 0; i < vis.nbaYearDataArray.length; i++) {
        vis.nbaYearData[vis.nbaYearDataArray[i].area] = vis.nbaYearDataArray[i];
    }

    // Set tooltips
    vis.setToolTips();

    vis.initVis();
}

PlayerMap.prototype.initVis = function() {
    var vis = this;

    // JOIN data with any existing elements
    vis.mapPath = vis.svg.append("g")
        .attr("class", vis.mapUnit)
        .selectAll("path")
        .data( vis.unpackedFeatures.features, function(d) {
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
            .style("stroke","black")
            .style('stroke-width', 0.3)
            .on('mouseover',function(d){
                vis.tip.show(d);

                var hoverStrokeWidth = vis.currentZoom > 4 ? 2 : 3;

                d3.selectAll('.' + this.getAttribute('class'))
                    .style("opacity", 1)
                    .style("stroke","black")
                    .style("stroke-width", hoverStrokeWidth);
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
                infoBoxActive = true;

                infoBoxSelection = d;
                infoBoxMapUnit = vis.mapUnit;

                updateInfoText();
            })
            .style("fill", function(d) {
                if(typeof vis.nbaYearData[d.properties.name] != "undefined") {
                    return vis.color(vis.nbaYearData[d.properties.name][currentProperty]/populationData[vis.mapUnit][displayYear-1][d.properties.name]);
                }
                else {
                    return "white";
                }    
            });

    vis.wrangleData(vis.mapUnit);
}


PlayerMap.prototype.wrangleData = function() {
    var vis = this;

    vis.nbaYearDataArray = generateYearData(nbaData, vis.allAreas, vis.mapUnit, displayYear, cumulativeStatus);
    vis.nbaYearData = {};
    for (var i = 0; i < vis.nbaYearDataArray.length; i++) {
        vis.nbaYearData[vis.nbaYearDataArray[i].area] = vis.nbaYearDataArray[i];
    }

    vis.updateVis();
}


PlayerMap.prototype.updateVis = function() {
    var vis = this;

    if (totalsPerCapita == "per_capita") {
        vis.color = d3.scaleLog()
            .domain(
                d3.extent(vis.unpackedFeatures.features.filter(function(d){
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
                else if(typeof vis.nbaYearData[d.properties.name] != "undefined") {
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

PlayerMap.prototype.setToolTips = function() {
    var vis = this;

    vis.tip = d3.tip()
        .attr('class', 'd3-tip')
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
            var tipText = "<strong>" + tipUnit + ": </strong><span class='details'>" + areaName + "<br><br></span>";
            tipText += "<strong>NBA Players: </strong><span class='details'>" + playerCount + "<br></span>";
            tipText += "<strong>All-Stars: </strong><span class='details'>" + allStarCount + "<br><br></span>";

            var densityValue = vis.nbaYearData[areaName][currentProperty]/(populationData[vis.mapUnit][displayYear-1][d.properties.name]/1000000);

            if (densityValue != 'Infinity' && !isNaN(densityValue)) {
                if(currentProperty == 'num_all_stars') {
                    var playerUnit = 'All-Stars'
                }
                else {
                    var playerUnit = 'NBA Players'
                }

                tipText += "<strong>Population (" + displayYear + "): </strong><span class='details'>" + d3.format(',')(populationData[vis.mapUnit][displayYear-1][d.properties.name]) + "<br></span>";
                tipText += "<strong>" + playerUnit + "/1,000,000 People: </strong><span class='details'>" + d3.format('.2f')(densityValue) + "</span>";
            }

            if (phoneBrowsing == true) {
                infoBoxActive = true;

                infoBoxSelection = d;
                infoBoxMapUnit = vis.mapUnit;

                tipText += '<br><br><div id="pop-up-player-info-text" style="overflow-y:auto;"></div>';
            }
            return tipText;
        })

    vis.svg.call(vis.tip);

}
