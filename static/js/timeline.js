
Timeline = function(_parentElement) {

    this.parentElement = _parentElement;

    this.initVis();
}

Timeline.prototype.initVis = function() {
    var vis = this;

    // Create an SVG inside of hidden slider element, but with additional height so ticks are visible
    vis.svg = d3.select(vis.parentElement)
                .append("svg")
                .attr("preserveAspectRatio", "xMinYMin meet")
            	.attr("width", "105%")
            	.attr("height", "360%")
            	.attr("visibility", "visible");

    // Create an axis to overlay on top of scrollbar with same width and ticks (this is the "timeline")
    vis.timelineAxis = vis.svg
        .append('g')
            .attr('class', 'timeline-line')
            .attr("preserveAspectRatio", "xMinYMin meet")
        	.attr("width", "100%")
        	.attr("height", "120%")
            .attr("transform", "translate(0,5)")
            .attr('stroke', 'black')

    vis.updateDimensions();

}

// Update dimensions of timeline on a window resize so that it stays the same size as the hidden jquery ui slider under it
Timeline.prototype.updateDimensions = function() {
	
	var vis = this;

	vis.x = d3.scaleLinear()
    	.domain([1947,2020])
    	.range([0, $('.ui-slider').width()])

	vis.timelineAxis
        .style("font-size", "12pt")
        .style("font-family", "Helvetica Neue,helvetica,arial,sans-serif")
		.call(d3.axisBottom(vis.x)
            .tickSize(10)
			.tickValues([1960, 1980, 2000, 2020])
			.tickFormat(d3.format("")))
            .selectAll("text")
                .attr("transform", "translate(0,3)")
                .attr("class", "timeline-year-tick-label");
}