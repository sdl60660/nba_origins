
Timeline = function(_parentElement) {

    this.parentElement = _parentElement;

    this.initVis();
}

Timeline.prototype.initVis = function() {
    var vis = this;


    vis.svg = d3.select(vis.parentElement)
                .append("svg")
                .attr("preserveAspectRatio", "xMinYMin meet")
            	.attr("width", "105%")
            	.attr("height", "250%")
            	.attr("visibility", "visible");

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

Timeline.prototype.updateDimensions = function() {
	
	var vis = this;

	vis.x = d3.scaleLinear()
    	.domain([1947,2020])
    	.range([0, $('.ui-slider').width()])

	vis.timelineAxis
		.call(d3.axisBottom(vis.x)
			.tickValues([1950, 1960, 1970, 1980, 1990, 2000, 2010, 2020])
			.tickFormat(d3.format("")));
}