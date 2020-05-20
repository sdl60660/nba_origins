
SortableTable = function(_parentElement) {
    this.parentElement = _parentElement;

    this.initVis();
}

SortableTable.prototype.initVis = function() {
    var vis = this;  

    vis.column_names = ["City", "Population", "Player Count", "Per Capita"];
    // vis.clicks = {title: 0, views: 0, created_on: 0, url: 0};

    vis.margin = {top: 50, right: 10, bottom: 5, left: 10};
    vis.width = 600 - vis.margin.left - vis.margin.right;
    vis.height = 800 - vis.margin.top - vis.margin.bottom;

    // draw the table
    // vis.svg = d3.select(vis.parentElement)
    //     .append("svg")
    //         .attr("class", "sortable-table-container")
    //         .attr("width", vis.width + vis.margin.left + vis.margin.right)
    //         .attr("height", vis.height + vis.margin.top + vis.margin.bottom);

    // vis.g = vis.svg.append("g")
    //     .attr("class", "sortable-table")
    //     .attr("transform",
    //           "translate(" + vis.margin.left + "," + vis.margin.top + ")");

    vis.table = d3.select(vis.parentElement).append("table")
        .attr("class", "data-table")
        .attr("width", vis.width)
        // .attr("height", vis.height);
    vis.header = vis.table.append("thead")
        .append("tr");

    vis.header
        .selectAll("th")
            .data(vis.column_names)
            .enter()
                .append("th")
                .text(function(d) {return d;})

    vis.tablebody = vis.table.append("tbody");

    
    /*d3.select(".SearchBar")
      .append("input")
        .attr("class", "SearchBar")
        .attr("id", "search")
        .attr("type", "text")
        .attr("placeholder", "Search...");*/
      
    // vis.table = d3.select("#FilterableTable").append("table");
    // vis.table.append("thead").append("tr"); 

    // vis.headers = vis.table.select("tr").selectAll("th")
    //     .data(vis.column_names)
    //   .enter()
    //     .append("th")
    //     .text(function(d) { return d; });


    vis.wrangleData();
}


SortableTable.prototype.wrangleData = function() {
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

    playerSelection.forEach(function(d) {
        d.fullCityName = d[(birthPlaceHS + '_city')] + ', ' + d[(birthPlaceHS + '_state')] + ', ' + d[(birthPlaceHS + '_country')];
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
        d.players = playerSelection.filter(function(x) {
            return x.fullCityName == d.city;
        }).length;
        d.city = d.city.split(', ')[0] + ', ' + d.city.split(', ')[1]
        delete d.country;
        if (d.population > 10000) {
            d.per_capita = 1000*Math.round(d.population / d.players / 1000);
        }
        else {
            d.per_capita = 100*Math.round(d.population / d.players / 100);
        }
       
    })


    vis.chartData = vis.chartData.filter(function(d) {
        return d.players >= 3 && d.population > 0;
    }).sort(function(a, b) {
        return a.per_capita - b.per_capita;
    })

    console.log(vis.chartData);

    vis.updateVis();
}


SortableTable.prototype.updateVis = function() {
    var vis = this;


    vis.rows = vis.tablebody
        .selectAll("tr")
            .data(vis.chartData, function(d) {
                return d.city;
            })
    
    vis.rows
        .exit()
            .remove()
    
    vis.rows = vis.rows
        .enter()
            .append("tr");


    vis.cells = vis.rows.selectAll("td")
        .data(function(d) { 
            var arr = [];
            for (var k in d) {
                arr.push(d[k]);
            }
            return arr;
        })
        .merge(vis.cells)
            .append("td")
            .text(function(d) {
                return d;
            })


}
