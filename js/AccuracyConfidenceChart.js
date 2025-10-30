/* * * * * * * * * * * * * *
*         PieChart         *
* * * * * * * * * * * * * */


class AccuracyConfidenceChart {

    // constructor method to initialize Timeline object
    constructor(parentElement, data) {
        this.parentElement = parentElement;
        this.data = data;
        this.displayData = data;
        this.initVis();
    }

    initVis() {
        let vis = this;

        // margin conventions
        vis.margin = {top: 10, right: 50, bottom: 10, left: 50};
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;
        if (vis.height < 200) vis.height = 500;
        // init drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

        // add title
        vis.svg.append('g')
            .attr('class', 'title target-chart')
            .append('text')
            .text('Title for Target Chart')
            .attr('transform', `translate(${vis.width / 2}, 20)`)
            .attr('text-anchor', 'middle');


        vis.tooltip = d3.select("body").append('div')
            .attr('class', "tooltip")
            .attr('id', 'pieTooltip')

        vis.accuracyConfidenceChart = vis.svg
            .append('g')
            .attr('class',  'target-chart')
            .attr("transform", "translate(" + vis.width / 2 + "," + vis.height / 2 + ")");
        
        vis.pie = d3.pie()
            .value(d => d.value);

        vis.color = d3.scaleOrdinal(d3.schemeCategory10);

        vis.colors = ["#c83737ff", "#ffffff"]

        vis.ringCount = 5;
        vis.maxRadius = Math.min(vis.width, vis.height) / 2.5;
        vis.ringThickness = vis.maxRadius / vis.ringCount;

        for (let i = 0; i < vis.ringCount; i++) {
            vis.accuracyConfidenceChart.append("circle")
                .attr("r", vis.maxRadius - i * vis.ringThickness)
                .attr("fill", vis.colors[i % 2])
        }
        this.wrangleData();
    }

    // wrangleData method
    wrangleData() {
        let vis = this

        vis.displayData = []

        vis.updateVis()

    }

    // updateVis method
    updateVis() {
        let vis = this;

        // TODO
        let arcs = vis.accuracyConfidenceChart.selectAll(".arc")
            .data(vis.pie(vis.displayData))

        arcs.enter()
            .append("path")
            .merge(arcs)
            .attr("d", vis.arc)
            .style("fill", function(d, index) { return vis.color(index); })
            .on('mouseover', function(event, d){
                d3.select(this)
                    .attr('stroke-width', '2px')
                    .attr('stroke', 'black')
                    .attr('fill', 'rgba(173,222,255,0.62)')
                vis.tooltip
                    .style("opacity", 1)
                    .style("left", event.pageX + 20 + "px")
                    .style("top", event.pageY + "px")
                    .html(`
                        <div style="border: thin solid grey; border-radius: 5px; background: lightgrey; padding: 20px">
                            <h3>Arc with index #${d.index}<h3>
                            <h4> value: ${d.value}</h4>      
                            <h4> startAngle: ${d.startAngle}</h4> 
                            <h4> endAngle: ${d.endAngle}</h4>   
                            <h4> data: ${JSON.stringify(d.data)}</h4>                         
                        </div>`);
            })
            .on('mouseout', function(event, d){
                d3.select(this)
                    .attr('stroke-width', '0px')
                    .attr("fill", d => d.data.color)

                vis.tooltip
                    .style("opacity", 0)
                    .style("left", 0)
                    .style("top", 0)
                    .html(``);
            });

        arcs.exit().remove();
    }
}