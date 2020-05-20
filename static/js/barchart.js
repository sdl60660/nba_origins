
BarChart = function(_parentElement, _mapUnit) {
    this.parentElement = _parentElement;

    this.initVis();
}


BarChart.prototype.initVis = function() {
    var vis = this;

vis.margin = {top: 80, right: 170, bottom: 50, left: 170};
    vis.width = 800 - vis.margin.left - vis.margin.right;
    vis.height = 600 - vis.margin.top - vis.margin.bottom;

    vis.svg = d3.select(vis.parentElement)
        .append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom);

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

    vis.t = d3.transition()
        .duration(500);

    vis.color = d3.scaleLog()
        .range(['#FFE4B2', 'orange'])
        .base(20);

    // Set tooltips
    vis.tip = d3.tip()
        .attr('class', 'd3-tip')
        .offset([-10, 0])
        .html(function(d) {

            var areaName = d.city;
            var playerCount = d.players;
            var tipUnit = "City";

            if(currentProperty == 'num_all_stars') {
                var playerUnit = 'All-Stars'
            }
            else {
                var playerUnit = 'NBA Players'
            }

            var tipText = "<strong>" + tipUnit + ": </strong><span class='details'>" + areaName + "<br></span>"
            tipText += "<strong>Population: </strong><span class='details'>" + d3.format(',')(d.population) + "<br></span>";
            tipText += "<strong>" + playerUnit + ": </strong><span class='details'>" + playerCount + "<br></span>";
            tipText += "<strong>" + playerUnit + "/100,000 People: </strong><span class='details'>" + d3.format('.1f')(d.per_capita) + "</span>";

            return tipText;
        })


    vis.wrangleData();
}



BarChart.prototype.wrangleData = function() {
    var vis = this;

    var playerSelection = playerList.filter(function(d) {
        if (cumulativeStatus == "active") {
            return d.start_year <= displayYear && d.end_year >= displayYear;
        }
        else {
            return d.start_year <= displayYear;
        }
    })

    if (currentProperty == "num_all_stars") {
        playerSelection = playerSelection.filter(function(d) {
            return d.all_star_appearances > 0;
        })
    }

    if (totalsPerCapita == 'totals') {
        vis.xProperty = 'players';
        vis.color
            .range(['#FFE4B2', 'orange']);
    }
    else {
        vis.xProperty = 'per_capita';
        vis.color
            .range(['#FFE4B2', '#FF3F00']);
    }

    playerSelection.forEach(function(d) {
        if (d[(birthPlaceHS + '_country')] == 'United States of America') {
            d.fullCityName = d[(birthPlaceHS + '_city')] + ', ' + d[(birthPlaceHS + '_state')] + ', ' + d[(birthPlaceHS + '_country')];
        }
        else {
            d.fullCityName = d[(birthPlaceHS + '_city')] + ', ' + d[(birthPlaceHS + '_country')];
        }
    })

    vis.chartData = [];
    for (city in cityCounts[birthPlaceHS]) {
        vis.chartData.push({
            'city': cityCounts[birthPlaceHS][city]['city'],
            'country': cityCounts[birthPlaceHS][city]['country'],
            'population': cityCounts[birthPlaceHS][city]['population']
        });
    }

    vis.chartData.forEach(function(d) {
        d.player_list = playerSelection.filter(function(x) {
            return x.fullCityName == d.city;
        });
        d.players = d.player_list.length;
        d.city = d.city.split(', ')[0] + ', ' + d.city.split(', ')[1];
        d.per_capita = d.players/(d.population/100000);
    })

    // vis.t
    //     .duration(500);

    if ($('#search-val').val().length > 0) {

        // Get search query from box
        var searchTerm = $('#search-val').val().toLowerCase();

        // Filter to only players whose cities contain the search term
        vis.chartData = vis.chartData.filter(function(d) {
            return d.city.toLowerCase().indexOf(searchTerm) !== -1;
        });

        // Lower threshold to a single NBA player so that any city with players will show up in the search
        var threshold = 1;

        // // Set a faster transition time if someone is typing
        // vis.t
        //     .duration(100);
    }
    else if (currentProperty == 'num_all_stars') {
        var threshold = 2;
    }
    else {
        var threshold = 5;
    }

    vis.chartData = vis.chartData.filter(function(d) {
        return d.players >= threshold && d.population > 0;
    }).sort(function(a, b) {
        return b[vis.xProperty] - a[vis.xProperty];
    })

    if (vis.chartData.length > 50) {
        vis.chartData = vis.chartData.slice(0,50);
    }

    console.log(vis.chartData);

    vis.svg.call(vis.tip);
    vis.updateVis();
}


BarChart.prototype.updateVis = function() {
    var vis = this;

    vis.y
        .domain(vis.chartData.map(function(d) { return d.city; }));

    vis.x
        .domain([0, d3.max(vis.chartData, function(d) {
            return d[vis.xProperty];
        })]);

    vis.yAxisCall
        .scale(vis.y)

    vis.yAxis
        .transition(vis.t)
            .call(vis.yAxisCall);


    vis.xAxisCall
        .ticks(Math.min(6, d3.max(vis.chartData, function(d) {
            return d[vis.xProperty];
        })))
        .scale(vis.x);

    vis.xAxis
        .transition(vis.t)
            .call(vis.xAxisCall);


    // JOIN data with any existing elements
    vis.barchart = vis.g
        .selectAll("rect")
        .data(vis.chartData, function(d) {
            return d.city;
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
                    return `${d.city.replace(/ /g, '-')} area-bar`
                })
                .style("opacity", 0.8)
                .attr("y", function(d) {
                    return vis.y(d.city);
                })
                .attr("height", vis.y.bandwidth)
                .attr("x",  vis.x(0))
                .attr("width", 0)
                .attr("fill", "red")
                .attr("default-stroke", 0.0)
                .on('mouseover', function(d) {
                    vis.tip.show(d);

                    d3.select(this)
                        .attr("stroke", "black")
                        .attr("stroke-width", "2px")
                })
                .on('mouseout', function(d){
                    vis.tip.hide(d);

                    d3.select(this)
                        .attr("stroke-width", "0px")
                })
                // .on('tap', function(d){
                //     vis.tip.show(d);
                // })
                .on('click', function(d) {
                    infoBoxActive = true;

                    infoBoxSelection = d;
                    infoBoxMapUnit = 'cities';

                    updateInfoText();
                })
                .style("fill", function(d) {
                    return "white";
                })
                .merge(vis.barchart)
                    .transition(vis.t)
                    .attr("width", function(d) {
                        return vis.x(d[vis.xProperty]);
                    })
                    .attr("x", function(d) {
                        return vis.x(0);
                    })
                    .attr("y", function(d) {
                        return vis.y(d.city);
                    })
                    .attr("height", vis.y.bandwidth)
                    .style("fill", function(d) {
                        return vis.color(Math.max(0.7, d[vis.xProperty]));
                    })
                    
}

