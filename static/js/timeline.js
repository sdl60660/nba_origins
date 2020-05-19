
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


    var x = d3.scaleLinear()
    	.domain([1947,2020])
    	.range([0, $('.ui-slider').width()])

    vis.svg
        .append('g')
        	.call(d3.axisBottom(x)
        			.tickValues([1950, 1960, 1970, 1980, 1990, 2000, 2010, 2020])
        			.tickFormat(d3.format("")))
            .attr('class', 'timeline-line')
            .attr("preserveAspectRatio", "xMinYMin meet")
        	.attr("width", "100%")
        	.attr("height", "120%")
            .attr("transform", "translate(0,5)")
            .attr('stroke', 'black')

}