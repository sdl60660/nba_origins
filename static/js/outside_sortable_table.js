
SortableTable = function(_parentElement) {
    this.parentElement = _parentElement;

    this.initVis();
}

SortableTable.prototype.initVis = function() {
    var vis = this;  

    vis.column_names = ["Title","Views","Created On","URL"];
    vis.clicks = {title: 0, views: 0, created_on: 0, url: 0};

    // draw the table
    d3.select("body").append("div")
      .attr("id", "container")

    d3.select("#container").append("div")
      .attr("id", "FilterableTable");

    d3.select("#FilterableTable").append("h1")
      .attr("id", "title")
      .text("My Youtube Channels")

    d3.select("#FilterableTable").append("div")
      .attr("class", "SearchBar")
      .append("p")
        .attr("class", "SearchBar")
        .text("Search By Title:");

    d3.select(".SearchBar")
      .append("input")
        .attr("class", "SearchBar")
        .attr("id", "search")
        .attr("type", "text")
        .attr("placeholder", "Search...");
      
    vis.table = d3.select("#FilterableTable").append("table");
    vis.table.append("thead").append("tr"); 

    vis.headers = vis.table.select("tr").selectAll("th")
        .data(vis.column_names)
      .enter()
        .append("th")
        .text(function(d) { return d; });

    vis.rows;
    vis.row_entries;
    vis.row_entries_no_anchor;
    vis.row_entries_with_anchor;

    /**  search functionality **/
    d3.select("#search")
      .on("keyup", function() { // filter according to key pressed 
        var searched_data = data,
            text = this.value.trim();
        
        var searchResults = searched_data.map(function(r) {
          var regex = new RegExp("^" + text + ".*", "i");
          if (regex.test(r.title)) { // if there are any results
            return regex.exec(r.title)[0]; // return them to searchResults
          } 
        })
        
        // filter blank entries from searchResults
        searchResults = searchResults.filter(function(r){ 
          return r != undefined;
        })
        
        // filter dataset with searchResults
        searched_data = searchResults.map(function(r) {
           return data.filter(function(p) {
            return p.title.indexOf(r) != -1;
          })
        })

        // flatten array 
        vis.searched_data = [].concat.apply([], searched_data)
        
        // data bind with new data
        vis.rows = table.select("tbody").selectAll("tr")
          .data(searched_data, function(d){ return d.id; })
        
        // enter the rows
        vis.rows.enter()
         .append("tr");
         
        // enter td's in each row
        vis.row_entries = vis.rows.selectAll("td")
            .data(function(d) { 
              var arr = [];
              for (var k in d) {
                if (d.hasOwnProperty(k)) {
                  arr.push(d[k]);
                }
              }
              return [arr[3],arr[1],arr[2],arr[0]];
            })
          .enter()
            .append("td") 

        // draw row entries with no anchor 
        vis.row_entries_no_anchor = vis.row_entries.filter(function(d) {
          return (/https?:\/\//.test(d) == false)
        })
        vis.row_entries_no_anchor.text(function(d) { return d; })

        // draw row entries with anchor
        vis.row_entries_with_anchor = vis.row_entries.filter(function(d) {
          return (/https?:\/\//.test(d) == true)  
        })
        vis.row_entries_with_anchor
          .append("a")
          .attr("href", function(d) { return d; })
          .attr("target", "_blank")
        .text(function(d) { return d; })
        
        // exit
        vis.rows.exit().remove();
      })
    
  /**  sort functionality **/
  vis.headers
    .on("click", function(d) {
      if (d == "Title") {
        vis.clicks.title++;
        // even number of clicks
        if (vis.clicks.title % 2 == 0) {
          // sort ascending: alphabetically
          vis.rows.sort(function(a,b) { 
            if (a.title.toUpperCase() < b.title.toUpperCase()) { 
              return -1; 
            } else if (a.title.toUpperCase() > b.title.toUpperCase()) { 
              return 1; 
            } else {
              return 0;
            }
          });
        // odd number of clicks  
        } else if (clicks.title % 2 != 0) { 
          // sort descending: alphabetically
          vis.rows.sort(function(a,b) { 
            if (a.title.toUpperCase() < b.title.toUpperCase()) { 
              return 1; 
            } else if (a.title.toUpperCase() > b.title.toUpperCase()) { 
              return -1; 
            } else {
              return 0;
            }
          });
        }
      } 
      if (d == "Views") {
        vis.clicks.views++;
        // even number of clicks
        if (vis.clicks.views % 2 == 0) {
          // sort ascending: numerically
          vis.rows.sort(function(a,b) { 
            if (+a.views < +b.views) { 
              return -1; 
            } else if (+a.views > +b.views) { 
              return 1; 
            } else {
              return 0;
            }
          });
        // odd number of clicks  
        } else if (clicks.views % 2 != 0) { 
          // sort descending: numerically
          vis.rows.sort(function(a,b) { 
            if (+a.views < +b.views) { 
              return 1; 
            } else if (+a.views > +b.views) { 
              return -1; 
            } else {
              return 0;
            }
          });
        }
      } 
      if (d == "Created On") {
        clicks.created_on++;
        if (clicks.created_on % 2 == 0) {
          // sort ascending: by date
          vis.rows.sort(function(a,b) { 
            // grep date and time, split them apart, make Date objects for comparing  
            var date = /[\d]{4}-[\d]{2}-[\d]{2}/.exec(a.created_on);
            date = date[0].split("-"); 
            var time = /[\d]{2}:[\d]{2}:[\d]{2}/.exec(a.created_on);
            time = time[0].split(":");
            var a_date_obj = new Date(+date[0],(+date[1]-1),+date[2],+time[0],+time[1],+time[2]);
          
            date = /[\d]{4}-[\d]{2}-[\d]{2}/.exec(b.created_on);
            date = date[0].split("-"); 
            time = /[\d]{2}:[\d]{2}:[\d]{2}/.exec(b.created_on);
            time = time[0].split(":");
            var b_date_obj = new Date(+date[0],(+date[1]-1),+date[2],+time[0],+time[1],+time[2]);
                      
            if (a_date_obj < b_date_obj) { 
              return -1; 
            } else if (a_date_obj > b_date_obj) { 
              return 1; 
            } else {
              return 0;
            }
          });
        // odd number of clicks  
        } else if (clicks.created_on % 2 != 0) { 
          // sort descending: by date
          vis.rows.sort(function(a,b) { 
            // grep date and time, split them apart, make Date objects for comparing  
            var date = /[\d]{4}-[\d]{2}-[\d]{2}/.exec(a.created_on);
            date = date[0].split("-"); 
            var time = /[\d]{2}:[\d]{2}:[\d]{2}/.exec(a.created_on);
            time = time[0].split(":");
            var a_date_obj = new Date(+date[0],(+date[1]-1),+date[2],+time[0],+time[1],+time[2]);
          
            date = /[\d]{4}-[\d]{2}-[\d]{2}/.exec(b.created_on);
            date = date[0].split("-"); 
            time = /[\d]{2}:[\d]{2}:[\d]{2}/.exec(b.created_on);
            time = time[0].split(":");
            var b_date_obj = new Date(+date[0],(+date[1]-1),+date[2],+time[0],+time[1],+time[2]);
                      
            if (a_date_obj < b_date_obj) { 
              return 1; 
            } else if (a_date_obj > b_date_obj) { 
              return -1; 
            } else {
              return 0;
            }
          });
        }
      }
      if (d == "URL") {
        vis.clicks.url++;
        // even number of clicks
        if (vis.clicks.url % 2 == 0) {
          // sort ascending: alphabetically
          vis.rows.sort(function(a,b) { 
            if (a.thumb_url_default.toUpperCase() < b.thumb_url_default.toUpperCase()) { 
              return -1; 
            } else if (a.thumb_url_default.toUpperCase() > b.thumb_url_default.toUpperCase()) { 
              return 1; 
            } else {
              return 0;
            }
          });
        // odd number of clicks  
        } else if (clicks.url % 2 != 0) { 
          // sort descending: alphabetically
          vis.rows.sort(function(a,b) { 
            if (a.thumb_url_default.toUpperCase() < b.thumb_url_default.toUpperCase()) { 
              return 1; 
            } else if (a.thumb_url_default.toUpperCase() > b.thumb_url_default.toUpperCase()) { 
              return -1; 
            } else {
              return 0;
            }
          });
        }   
      }      
    }) // end of click listeners

    vis.wrangleData();
}


SortableTable.prototype.wrangleData = function() {
    var vis = this;


    vis.updateVis();
}


SortableTable.prototype.updateVis = function() {
    var vis = this;

    // draw table body with rows
    vis.table.append("tbody")

    // data bind
    vis.rows = table.select("tbody").selectAll("tr")
        .data(data, function(d){ return d.id; });

    // enter the rows
    vis.rows.enter()
        .append("tr")

    // enter td's in each row
    vis.row_entries = vis.rows.selectAll("td")
        .data(function(d) { 
            var arr = [];
            for (var k in d) {
                if (d.hasOwnProperty(k)) {
                    arr.push(d[k]);
                }
            }
            return [arr[3],arr[1],arr[2],arr[0]];
        })
    .enter()
        .append("td") 

    // draw row entries with no anchor 
    vis.row_entries_no_anchor = vis.row_entries.filter(function(d) {
    return (/https?:\/\//.test(d) == false)
    })
    vis.row_entries_no_anchor.text(function(d) { return d; })

    // draw row entries with anchor
    vis.row_entries_with_anchor = vis.row_entries.filter(function(d) {
    return (/https?:\/\//.test(d) == true)  
    })
    vis.row_entries_with_anchor
        .append("a")
        .attr("href", function(d) { return d; })
        .attr("target", "_blank")
        .text(function(d) { return d; })


}
