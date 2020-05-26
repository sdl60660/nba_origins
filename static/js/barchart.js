
BarChart = function(_parentElement, _mapUnit) {
    this.parentElement = _parentElement;

    this.initVis();
}


BarChart.prototype.initVis = function() {
    var vis = this;

    vis.margin = {top: 35, right: 170, bottom: 45, left: 170};
    vis.width = 850 - vis.margin.left - vis.margin.right;
    vis.height = 520 - vis.margin.top - vis.margin.bottom;

    vis.svg = d3.select(vis.parentElement)
        .append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom);

    vis.g = vis.svg.append("g")
        .attr("class", vis.parentGroupClass)
        .attr("id", "chart-data")
        .attr("transform",
              "translate(" + vis.margin.left + "," + vis.margin.top + ")");

    // Adjust the visibility attribute of the no result help text (hidden during loading), but then hide it unless there are no results
    $('#no-result-help-text')
        .css("visibility", "visible")
        .hide();

    // Set x and y scales, keeping in mind that it's a horizontal barchart, not vertical
    vis.y = d3.scaleBand()
        .range([0, vis.height])
        .paddingInner(0.1);

    vis.x = d3.scaleLinear()
        .range([ 0, vis.width ])


    // Add Axes
    vis.xAxisCall = d3.axisTop();

    vis.xAxis = vis.g.append("g")
        .attr("transform", "translate(0," + -2 + ")")
        .attr("class", "x axis");
        
    vis.yAxisCall = d3.axisLeft()

    vis.yAxis = vis.g.append("g")
        .attr("class", "y axis");


    // Set log color scale, which matches the color scale for the maps
    vis.color = d3.scaleLog()
        .range(['#FFE4B2', 'orange'])
        .base(20);

    // Set tooltips
    vis.setToolTips();

    vis.wrangleData();
}



BarChart.prototype.wrangleData = function() {
    var vis = this;

    // Initialize the chart data with the city population data
    vis.chartData = [];
    for (city in populationData['cities']) {
        vis.chartData.push(populationData['cities'][city]);
    }

    // Append player counts, player lists and per-capita figures to each city using the filtered player list
    vis.chartData.forEach(function(d) {
        if ( typeof nbaData['cities'][birthPlaceHS][('$' + d.city)] == 'undefined' ) {
            d.player_list = [];
            d.players = 0;
            d.per_capita = 0;

        }

        else {

            d.player_list = nbaData['cities'][birthPlaceHS][('$' + d.city)].filter(function(x) {
                // If 'all-stars' is selected, filter out any players without all-star selection
                if (currentProperty == "num_all_stars" && x.all_star_appearances == 0)  {
                    return false;
                }
                // Filter by year (either by whether they were active or had entered the league, depending on active/all-time selection)
                else if (cumulativeStatus == "active") {
                    return x.start_year <= displayYear && x.end_year >= displayYear;
                }
                else {
                    return x.start_year <= displayYear;
                }
            })

            d.players = d.player_list.length;
            d.per_capita = d.players/(d.population/100000);
        }
    })

    console.log(vis.chartData);

    // If totals is selected, use color scale 1 and set the xProperty, used in updateVis(), to 'players'
    // Otherwise, use color scale 2 and set the xProperty to 'per_capita' (these color scales match the maps')
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

    // If there's a value in the search box, filter the chartData cities to only those with a matching substring to the search query
    // Also, lower the threshold on number of players to 1, so that any city matching the query will appear, even if there's only one player
    if ($('#search-val').val().length > 0) {

        // Get search query from box
        var searchTerm = $('#search-val').val().toLowerCase();

        // Filter to only players whose cities contain the search term
        vis.chartData = vis.chartData.filter(function(d) {
            return d.city.toLowerCase().indexOf(searchTerm) !== -1;
        });

        // Lower threshold to a single NBA player so that any city with players will show up in the search
        var threshold = 1;
    }
    // If there's no query, and the 'all-star' filter is selected, set threshold at 2, so that a city must have at least two players to appear
    else if (currentProperty == 'num_all_stars') {
        var threshold = 2;
    }
    // Otherwise, the threshold defaults to 4, which seemed to be a happy medium
    else {
        var threshold = 4;
    }

    // If 'per-capita' is selected, only cities/towns with population data will be able to be displayed
    if(totalsPerCapita == 'per_capita') {
        vis.chartData = vis.chartData.filter(function(d) {
             return d.population > 0;
        })
    }

    // Filter the chart data by those with a player count over the threshold and
    // Sort the chart data by the current xProperty so that the largest bars are at the top
    vis.chartData = vis.chartData.filter(function(d) {
        return d.players >= threshold;
    }).sort(function(a, b) {
        return b[vis.xProperty] - a[vis.xProperty];
    })

    

    // If more than 35 cities make it through the filter, only display the top 35 so that the chart is legible
    if (vis.chartData.length > 35) {
        vis.chartData = vis.chartData.slice(0,35);
    }
    
    // If there are no items in the chart, display the no result help text and exit
    if (vis.chartData.length == 0) {
        $('#chart-data')
            .hide();

        $('#no-result-help-text')
            .show();
    }
    // Otherwise, make sure the help text is hidden and update the visualization
    else {
        $('#chart-data')
            .show();

        $('#no-result-help-text')
            .hide();

        vis.updateVis();  
    }

    

}


BarChart.prototype.updateVis = function() {
    var vis = this;

    // Ensure a maximum bar size. If there are less than minBarSlots number of bars,
    // the range of the Y-Axis will be scaled down proportionately to keep bars at max width (height)
    var minBarSlots = 12;

    if (vis.chartData.length < minBarSlots) {
        vis.y
            .range([0, (vis.chartData.length/minBarSlots)*vis.height])
    }
    else {
        vis.y
            .range([0, vis.height])
    }

    // Set y-axis domain to the set of cities in the filtered data
    vis.y
        .domain(vis.chartData.map(function(d) { return d.city; }));

    // Set the max on the x-axis domain to match the max value in the filtered data
    vis.x
        .domain([0, d3.max(vis.chartData, function(d) {
            return d[vis.xProperty];
        })]);

    // Call axes
    vis.yAxisCall
        .scale(vis.y)

    vis.yAxis
        .transition()
            .call(vis.yAxisCall);

    vis.xAxisCall
        .ticks(Math.min(6, d3.max(vis.chartData, function(d) {
            return d[vis.xProperty];
        })))
        .scale(vis.x);

    vis.xAxis
        .transition()
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
                .on('click', function(d) {
                    infoBoxActive = true;

                    infoBoxSelection = d;
                    infoBoxMapUnit = 'cities';

                    updateInfoText();
                })
                .style("fill", function(d) {
                    return "white";
                })
                // and UPDATE any existing elements (matched by city name)
                .merge(vis.barchart)
                    .transition()
                    .attr("width", function(d) {
                        return vis.x(d[vis.xProperty]);
                    })
                    .attr("x", function(d) {
                        return vis.x(0);
                    })
                    .attr("y", function(d) {
                        return vis.y(d.city);
                    })
                    .attr("height", function(d) {
                        return vis.y.bandwidth();
                    })
                    .style("fill", function(d) {
                        return vis.color(Math.max(0.7, d[vis.xProperty]));
                    })
                    
}


BarChart.prototype.setToolTips = function() {
    var vis = this;

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

            if (d.population == null || d.population == 0) {
                var displayPopulation = 'N/A'
                var displayDensity = 'N/A'
            }
            else {
                var displayPopulation = d3.format(',')(d.population);
                var displayDensity = d3.format('.1f')(d.per_capita);
            }

            var tipText = "<strong>" + tipUnit + ": </strong><span class='details'>" + areaName + "<br><br></span>"
            tipText += "<strong>Population: </strong><span class='details'>" + displayPopulation + "<br></span>";
            tipText += "<strong>" + playerUnit + ": </strong><span class='details'>" + playerCount + "<br></span>";
            tipText += "<strong>" + playerUnit + "/100,000 People: </strong><span class='details'>" + displayDensity + "</span>";

            if (phoneBrowsing == true) {
                infoBoxActive = true;

                infoBoxSelection = d;
                infoBoxMapUnit = 'cities';

                tipText += '<br><br><div id="pop-up-player-info-text" style="overflow-y:auto;"></div>';
            }
            return tipText;
        })

    vis.svg.call(vis.tip);

}

