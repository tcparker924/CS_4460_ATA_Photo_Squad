class SearchesOverTimeChart {

    constructor(parentElement, data) {
        this.parentElement = parentElement;
        this.data = data;
        this.displayData = data;

        this.initVis();
    }

    initVis() {
        let vis = this;

        vis.margin = {top: 40, right: 40, bottom: 60, left: 60};

        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;

        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", `translate(${vis.margin.left}, ${vis.margin.top})`);

        vis.x = d3.scaleTime()
            .range([0, vis.width]);

        vis.y = d3.scaleLinear()
            .range([vis.height, 0]);

        vis.xAxis = d3.axisBottom(vis.x).ticks(d3.timeYear.every(1));
        vis.yAxis = d3.axisLeft(vis.y);

        vis.svg.append("g")
            .attr("class", "x-axis")
            .attr("transform", `translate(0, ${vis.height})`);

        vis.svg.append("g")
            .attr("class", "y-axis");

        vis.line = d3.line()
            .x(d => vis.x(d.date))
            .y(d => vis.y(d.value));

        vis.path = vis.svg.append("path")
            .attr("class", "trend-line")
            .attr("fill", "none")
            .attr("stroke", "#1f77b4")
            .attr("stroke-width", 2);

        vis.wrangleData();
    }

    wrangleData() {
        let vis = this;

        vis.updateVis();
    }

    updateVis() {
        let vis = this;

        vis.x.domain(d3.extent(vis.displayData, d => d.date));
        vis.y.domain([0, d3.max(vis.displayData, d => d.value)]);

        vis.svg.select(".x-axis").call(vis.xAxis);
        vis.svg.select(".y-axis").call(vis.yAxis);

        vis.path.datum(vis.displayData)
            .transition()
            .duration(800)
            .attr("d", vis.line);
    }
}
