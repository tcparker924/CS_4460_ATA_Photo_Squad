class GenerationRateOverTimeChart {


    constructor(parentElement, data) {
        this.parentElement = parentElement;
        this.data = data;
        this.displayData = data;
        this.dataIndex = 0;
        this.currentDate = data[2].date
        this.currentValue = data[2].value

        this.initVis();
    }


    initVis() {
        let vis = this;

        d3.select("#year-slider").on("input", function () {
            const selectedYear = +this.value;

            let data_found = false;

            for (let i = 0; i < vis.data.length; i++) {
                const parseTime = d3.utcParse("%Y");
                if (vis.data[i].date.getTime() === parseTime(selectedYear).getTime()) {
                    vis.currentDate = vis.data[i].date;
                    vis.currentValue = vis.data[i].value;
                    data_found = true;
                }
            }

            if (!data_found) {
                const parseTime = d3.utcParse("%Y");
                vis.currentDate = parseTime(selectedYear);
                vis.currentValue = parseInt(vis.data[vis.data.length - 1].value) + (12000000000 * ((selectedYear - vis.data[vis.data.length - 1].date.getFullYear() - 1)));
            }

            vis.wrangleData();
        });

        vis.margin = {top: 40, right: 40, bottom: 60, left: 60};

        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;

        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", `translate(${vis.margin.left}, ${vis.margin.top})`);

        vis.svg_legend = d3.select("#generation-rate-over-time-legend").append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.margin.top)
            .append("g")
            .attr("transform", `translate(${0}, ${0})`);

        vis.legendGroup = vis.svg_legend.append("g")
            .attr("class", "legend-group")
            .attr("transform", `translate(${10}, ${vis.margin.top / 2})`);

        vis.legendGroup.append("circle")
            .attr("r", 8)
            .attr("fill", "#2c7fb8");

        vis.legendGroup.append("text")
            .attr("x", 12)
            .attr("y", 5)
            .text("= 100 Million Generated Images")
            .style("font-size", "14px")
            .style("fill", "#333");

        vis.wrangleData();
    }

    wrangleData() {
        let vis = this;

        vis.displayData = [];

        let temp_val = vis.currentValue;
        const chunkValue = 100000000;
        const circleCount = Math.ceil(temp_val / chunkValue);


        console.log(circleCount);
        console.log(vis.data);

        for (let i = 0; i < circleCount; i++) {
            vis.displayData.push({
                value: chunkValue,
                radius: circleCount <= 300 ? 8 : 8 * (Math.pow(0.845, (circleCount - 300) / 120)),
                color: "#2c7fb8"
            });
        }


        const centerX = vis.width / 2;
        const centerY = vis.height / 2;

        if (vis.simulation) {
            vis.simulation.stop();
        }

        vis.simulation = d3.forceSimulation(vis.displayData)
            .force("center", d3.forceCenter(centerX, centerY))
            .force("x", d3.forceX(centerX).strength(0.01))
            .force("y", d3.forceY(centerY).strength(0.01))
            .force("collision", d3.forceCollide().radius(d => d.radius * 1.1).iterations(2))
            .on("tick", () => vis.updateVis());
    }


    updateVis() {
        let vis = this;

        vis.svg.selectAll("circle")
            .data(vis.displayData)
            .join("circle")
            .attr("r", d => d.radius)
            .attr("cx", d => d.x)
            .attr("cy", d => d.y)
            .attr("fill", d => d.color);


    }


}
