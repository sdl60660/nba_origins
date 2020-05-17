

BubblePlot = function(_parentElement, _mapUnit, _geoJSON, _dimensions) {
    this.parentElement = _parentElement;
    this.mapUnit = _mapUnit;
    this.geoJSON = _geoJSON;
    this.dimensions = _dimensions;

    this.initVis();
}


BubblePlot.prototype.initVis = function() {
    var vis = this;

    // set the dimensions and margins of the graph
    vis.margin = {top: 30, right: 50, bottom: 80, left: 50};
    vis.width = vis.dimensions[0] - vis.margin.left - vis.margin.right,
    vis.height = vis.dimensions[1] - vis.margin.top - vis.margin.bottom;

    // append the svg object to the body of the page
    vis.svg = d3.select(vis.parentElement)
      .append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
    
    vis.g = vis.svg.append("g")
        .attr("transform",
              "translate(" + vis.margin.left + "," + vis.margin.top + ")");


    vis.x = d3.scaleLog()
        .domain([ 150000, 40000000 ])
        .range([ 0, vis.width ])
        // .exponent(chartScaleExponent);
    
    vis.xAxis = vis.g.append("g")
        .attr("transform", "translate(0," + (vis.height + 20) + ")")
        .call(d3.axisBottom(vis.x)
            .tickValues([200000, 2000000, 20000000])
            .tickFormat(function (d) {
                return d3.format(",d")(d);
                }));
                // .tickValues([0, 20,30,40,50,60,70,80,90,100]));

    vis.tip = d3.tip().attr('class', 'd3-tip')
        .html(function(d) {
            var text ="<span style='color:white'>" + d.area + "</span></br>"
            return text;
    })
    vis.g.call(vis.tip);

    vis.y = d3.scaleLog()
        // .domain([ 1, 450 ])
        .range([ vis.height, 0 ])
        .base(2);
        // .exponent(chartScaleExponent);
    vis.yAxis = vis.g.append("g");
        // .call(d3.axisLeft(vis.y));
                // .tickValues([0, 20,30,40,50,60,70,80,90,100]));

    // Add a scale for bubble size
    // vis.z = d3.scaleLog()
    //     .range([ 3, 20 ]);

    vis.regionColor = d3.scaleOrdinal()
        .domain(['Pacific', 'Mountain West', 'Southwest', 'Southeast', 'Midwest', 'Mid-Atlantic', 'New England'])
        .range(["#4e79a7","#f28e2c","#e15759","#76b7b2","#59a14f","#edc949","#af7aa1","#ff9da7","#9c755f","#bab0ab"]);

    vis.dividerLine = vis.g.append("line")
        .attr("x1", 0)
        .attr("x2", vis.width)
        .attr("y1", vis.height)
        .attr("y2", 0)
        .attr("class", "divider-line")
        .attr("stroke", "black")
        .style("stroke-dasharray", ("3, 3"));

    vis.g.append("text")
        .attr("class", "x-axis-label")
        .attr("x", -3)
        .attr("y", vis.height + 23)
        .attr("font-size", "10px")
        .attr("text-anchor", "end")
        .text("None")

    vis.g.append("text")
        .attr("class", "x-axis-label")
        .attr("x", vis.width/2)
        .attr("y", vis.height + 60)
        .attr("text-anchor", "middle")
        .attr("font-size", "15px")
        .text("Population")

    vis.g.append("text")
        .attr("class", "y-axis-label")
        .attr("x", -vis.height/2)
        .attr("y", -33)
        .attr("text-anchor", "middle")
        .attr("font-size", "15px")
        .attr("transform", "rotate(-90)")
        .text("NBA Players")

    vis.addBackgroundColoring();
    vis.wrangleData();
}


BubblePlot.prototype.wrangleData = function() {
    var vis = this;

    console.log(nbaData[vis.mapUnit]);

    vis.allAreas = vis.geoJSON.features.map(function(d) {
            return d.properties;
        });
    vis.chartData = generateYearData(nbaData, vis.allAreas, vis.mapUnit, displayYear, cumulativeStatus);

    console.log(vis.chartData);

    vis.updateVis();
}


BubblePlot.prototype.updateVis = function() {
    var vis = this;

    vis.defaultOpacity = 0.7;

    vis.y
        .domain([1, 1.1*d3.max(vis.chartData, function(d) {
            return d[currentProperty];
        })])

    vis.yAxisCall = d3.axisLeft()
        .scale(vis.y)
    vis.yAxis
        .transition()
            .call(vis.yAxisCall);

    // vis.chartData.sort((a, b) => (a.reviewed_episode_count < b.reviewed_episode_count) ? 1 : -1)

    // vis.z
    //     .domain([
    //         d3.min(vis.chartData, function(d) {
    //             return d.reviewed_episode_count;
    //         }),
    //         Math.max(d3.max(vis.chartData, function(d) {
    //             return d.reviewed_episode_count;
    //         }), 30)
    //     ]);

    // JOIN data with any existing elements
    vis.circles = vis.g.selectAll("circle")
        .data(vis.chartData, function(d) {
            return d.area;
        })

    // EXIT old elements not present in new data
    vis.circles
        .exit()
            .transition()
                .duration(300)
                .attr("r", 0)
            .remove();

    // ENTER new elements present in the data...
    vis.circles
        .enter()
        .append("circle")
            .attr("opacity", vis.defaultOpacity)
            .attr("stroke", "black")
            .attr("r", 8)
            .attr("class", function(d) { return (vis.mapUnit + '-pop-bubble'); })
            .attr("id", function(d) { return (vis.area + '-pop-bubble'); })
            .style("fill", function(d) {
                return vis.regionColor(d.region);
            })
            .on("mouseover", function(d, i, n) {
                mouseover(d, n[i]);
            })
            .on("mouseout", function(d) {
                mouseout(d);
            })
            .merge(vis.circles)
                .transition()
                    // .delay(showChartsTransitionOutDuration + 50)
                    .duration(300)
                    .attr("cy", function (d) { 
                        if (d[currentProperty] == 0) {
                            return vis.height + 20;
                        }
                        else {
                            return vis.y(d[currentProperty]); 
                        }
                    } )
                    .attr("cx", function (d) {
                        if (typeof populationData[vis.mapUnit][displayYear-1][d.area]  === 'undefined') {
                            return vis.x(0);
                        }
                        else {
                            return vis.x(populationData[vis.mapUnit][displayYear-1][d.area]);
                        }  
                    })

                // .attr("r", function (d) { return vis.z(d.reviewed_episode_count); } )

    function mouseover(data, object) {
        vis.tip.show(data);

        /*vis.g.selectAll("circle")
            .attr("opacity", 0.4);

        d3.select(object)
            .attr("opacity", 0.9);

        d3.selectAll(".season-" + object.getAttribute("season") + "-label")
            .attr("opacity", 1.0);*/

    }

    function mouseout(data) {
        vis.tip.hide(data);

        /*vis.g.selectAll("circle")
            .attr("opacity", vis.defaultOpacity);

        d3.selectAll(".season-label")
            .attr("opacity", 0.0);*/
    }

    // vis.svg.select(".legend-group").remove();
    // vis.attachCircleSizeLegend();

}


BubblePlot.prototype.addBackgroundColoring = function() {
    var vis = this;

    vis.grad = vis.svg.append('defs')
        .append('linearGradient')
        .attr('id', 'grad')
        .attr('x1', '0%')
        .attr('x2', '100%')
        .attr('y1', '0%')
        .attr('y2', '100%');

    var colors = ['green','white','red']
    vis.grad.selectAll('stop')
        .data(colors)
        .enter()
        .append('stop')
        .style('stop-color', function(d){ return d; })
        .attr('offset', function(d,i){
            return 100 * (i / (colors.length - 1)) + '%';
        });

    vis.g.append("rect")
        .attr("x", 0)
        .attr("width", vis.width)
        .attr("y", 0)
        .attr("height", vis.height)
        .attr("fill", 'url(#grad)')
        .attr("fill-opacity", 0.25);

    /*vis.g.append("text")
        .attr("x", vis.width - 15)
        .attr("y", vis.height - 20)
        .attr("text-anchor", "end")
        .text("AV Club Rates Lower Relative to IMDB Rating")

    vis.g.append("text")
        .attr("x", 20)
        .attr("y", 20)
        .attr("width", 30)
        .attr("text-anchor", "start")
        .text("AV Club Rates Higher Relative to IMDB Rating")*/
}

