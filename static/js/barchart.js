
BarChart = function(_parentElement, _mapUnit, _geoJSON) {

    this.parentElement = _parentElement;
    this.mapUnit = _mapUnit;
    this.geoJSON = _geoJSON;

    this.initVis();
}


BarChart.prototype.initVis = function() {
    var vis = this;

    vis.margin = {top: 18, right: 10, bottom: 15, left: 180};
    vis.width = 450 - vis.margin.left - vis.margin.right;
    vis.height = 600 - vis.margin.top - vis.margin.bottom;

    vis.svg = d3.select(vis.parentElement)
        .append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
        .append('g')
        .attr('class', 'barchart');

    vis.g = vis.svg.append("g")
        .attr("class", vis.parentGroupClass)
        .attr("transform",
              "translate(" + vis.margin.left + "," + vis.margin.top + ")");

    vis.y = d3.scaleBand()
        .range([0, vis.height])
        // .domain()
        .paddingInner(0.1);

    vis.x = d3.scaleLinear()
        // .domain()
        .range([ 0, vis.width ])


    // Add Axes
    vis.xAxisCall = d3.axisTop()
        // .orient("left")
        // .ticks(Math.min(10, ))
        // .tickFormat(d3.format("d"));

    vis.xAxis = vis.g.append("g")
        .attr("transform", "translate(0," + -2 + ")")
        .attr("class", "x axis");
        
    vis.yAxisCall = d3.axisLeft()

    vis.yAxis = vis.g.append("g")
        .attr("class", "y axis");
        
            // .transition()

    vis.allAreas = vis.geoJSON.features.map(function(d) {
            return d.properties;
        });

    vis.t = d3.transition()
        .duration(500);

    vis.color = d3.scaleLog()
        .range(['#FFE4B2', 'orange']);

    // Set tooltips
    vis.tip = d3.tip()
        .attr('class', 'd3-tip')
        .offset([-10, 0])
        .html(function(d) {

            var areaName = d.area;
            var playerCount = d['num_players'];

            if(vis.mapUnit == 'states') {
                var tipUnit = 'State';
            }
            else {
                var tipUnit = 'Country';
            }

            var tipText = "<strong>" + tipUnit + ": </strong><span class='details'>" + areaName + "<br></span>"
            tipText += "<strong>NBA Players: </strong><span class='details'>" + playerCount + "<br></span>";
            tipText += "<strong>All-Stars: </strong><span class='details'>" + d['num_all_stars'] + "</span>";

            return tipText;
        })


    vis.wrangleData();
}



BarChart.prototype.wrangleData = function() {
    var vis = this;

    vis.areaData = generateYearData(nbaData, vis.allAreas, vis.mapUnit, displayYear, cumulativeStatus);

    vis.areaData = vis.areaData.sort( (a,b) => {
        return b[currentProperty] - a[currentProperty];
    })

    if (vis.mapUnit == 'countries' && vis.areaData.length > 50) {
        vis.areaData = vis.areaData.slice(0, 50);
    }

    // color.domain([1, 1000])

    vis.svg.call(vis.tip);
    vis.updateVis();
}


BarChart.prototype.updateVis = function() {
    var vis = this;

    vis.y
        .domain(vis.areaData.map(function(d) { return d.area; }));

    vis.x
        .domain([0, Math.round(1.05*d3.max(vis.areaData, function(d) {
            return d[currentProperty];
        }))]);

    vis.yAxisCall
        .scale(vis.y)

    vis.yAxis
        .transition(vis.t)
            .call(vis.yAxisCall);


    vis.xAxisCall
        .ticks(Math.min(10, d3.max(vis.areaData, function(d) {
            return d[currentProperty];
        })))
        .scale(vis.x);

    vis.xAxis
        .transition(vis.t)
            .call(vis.xAxisCall);


    // JOIN data with any existing elements
    vis.barchart = vis.g
        .selectAll("rect")
        .data(vis.areaData, function(d) {
            return d.area;
        })

    // EXIT old elements not present in new data (this shouldn't be the case)
    vis.barchart
        .exit()
            .remove()

    // ENTER new elements present in the data...
    vis.barchart
        .enter()
            .append("rect")
                .attr("class", function(d) {
                    return `${d.area.replace(/ /g, '-')} area-bar ${vis.mapUnit}-bar`
                })
                .style("opacity", 0.8)
                .attr("y", function(d) {
                    return vis.y(d.area);
                })
                .attr("height", vis.y.bandwidth)
                .attr("x",  vis.x(0))
                .attr("width", 0)
                .attr("fill", "red")
                .attr("default-stroke", 0.0)
                .on('mouseover', function(d) {
                    vis.tip.show(d);

                    d3.selectAll('.' + d.area.replace(/ /g, '-'))
                        .style("opacity", 1)
                        .style("stroke", "black")
                        .style("stroke-width", 3);
                })
                .on('mouseout', function(d){
                    vis.tip.hide(d);

                    d3.selectAll('.' + d.area.replace(/ /g, '-'))
                        .style("opacity", 0.8)
                        .style("stroke","black")
                        .style("stroke-width", function(e, i, n) {
                            return n[i].getAttribute('default-stroke')
                        });
                })
                .on('click', function(d){
                    vis.tip.show(d);

                    // d3.selectAll('.' + d.area.replace(/ /g, '-'))
                    //     .style("opacity", 0.8)
                    //     .style("stroke","black")
                    //     .style("stroke-width", function(e, i, n) {
                    //         return n[i].getAttribute('default-stroke')
                    //     });
                })
                .style("fill", function(d) {
                    return "white";
                })
                .merge(vis.barchart)
                    .transition(vis.t)
                    .attr("width", function(d) {
                        return vis.x(d[currentProperty]);
                    })
                    .attr("x", function(d) {
                        return vis.x(0);
                    })
                    .attr("y", function(d) {
                        return vis.y(d.area);
                    })
                    .attr("height", vis.y.bandwidth)
                    .style("fill", function(d) {
                        return vis.color(d[currentProperty]);
                    })
                    
}

