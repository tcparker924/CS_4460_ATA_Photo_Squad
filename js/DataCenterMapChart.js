class DataCenterMapChart {

    constructor(parentElement, data, worldData) {
        this.parentElement = parentElement;
        this.data = data;
        this.world = worldData;
        this.displayData = data;
        this.initVis();
    }

    initVis() {
        let vis = this;
        vis.legendValues = [1000, 100000, 500000];
        vis.margin = { top: 20, right: 20, bottom: 20, left: 20 };
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;

        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width)
            .attr("height", vis.height);

        vis.svg.append('g')
            .attr('class', 'title')
            .append('text')
            .text('US Data Centers')
            .attr('transform', `translate(${vis.width / 2}, 20)`)
            .attr('text-anchor', 'middle');

        vis.tooltip = d3.select("body").append('div')
            .attr('class', "tooltip")
            .attr('id', 'map-tooltip');

        vis.projection = d3.geoAlbersUsa()
            .translate([vis.width / 2, vis.height / 2])
            .scale(1000);

        vis.path = d3.geoPath().projection(vis.projection);

        vis.g = vis.svg.append("g");

        vis.g.selectAll(".state")
            .data(topojson.feature(vis.world, vis.world.objects.states).features)
            .enter().append("path")
            .attr("class", "state")
            .attr("d", vis.path)
            .attr("fill", "#eee")
            .attr("stroke", "#aaa");

        vis.filteredData = vis.data.filter(d =>
            d.operator && d.operator.trim().toLowerCase() !== "unknown"
        );
                
        vis.operatorCounts = d3.rollup(vis.filteredData, v => v.length, d => d.operator);

        vis.topOperators = Array.from(vis.operatorCounts.entries())
            .sort((a, b) => d3.descending(a[1], b[1]))
            .slice(0, 5)
            .map(d => d[0]);

        vis.displayData = vis.data.map(d => ({
            ...d,
            operator_grouped: vis.topOperators.includes(d.operator) ? d.operator : "Other"
        }));
        vis.operators = [...vis.topOperators, "Other"];
        vis.colorScale = d3.scaleOrdinal()
            .domain(vis.operators)
            .range(d3.schemeTableau10.slice(0, 6))
        
        //Legend
        vis.svg_legend = d3.select("#data-center-map-legend").append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.margin.top + 40)
            .append("g")
            .attr("transform", `translate(${20}, ${0})`);
        
        vis.legendGroup = vis.svg_legend.append("g")
            .attr("class", "legend-group")
            .attr("transform", `translate(${0}, ${vis.margin.top / 2})`);

        vis.legendGroup.append("circle")
            .attr("cx", 0)
            .attr("cy", 20)
            .attr("r", 5)
            .attr("fill", "#2c7fb8");

        vis.legendGroup.append("text")
            .attr("x", 12)
            .attr("y", 25)
            .text("= 2,000 square feet")
            .style("font-size", "14px")
            .style("fill", "#333");

        vis.legendGroup.append("circle")
            .attr("cx", 240)
            .attr("cy", 20)
            .attr("r", 10)
            .attr("fill", "#2c7fb8");

        vis.legendGroup.append("text")
            .attr("x", 260)
            .attr("y", 25)
            .text("= 200,000 square feet")
            .style("font-size", "14px")
            .style("fill", "#333");

        vis.legendGroup.append("circle")
            .attr("cx", 500)
            .attr("cy", 20)
            .attr("r", 20)
            .attr("fill", "#2c7fb8");

        vis.legendGroup.append("text")
            .attr("x", 530)
            .attr("y", 25)
            .text("= 20,00,000 square feet")
            .style("font-size", "14px")
            .style("fill", "#333");

        vis.colorLegend = vis.svg.append("g")
            .attr("class", "color-legend")
            .attr("transform", `translate(${50}, ${50})`); // adjust position as needed


        vis.legendItem = vis.colorLegend.selectAll(".legend-item")
            .data(vis.operators)
            .enter()
            .append("g")
            .attr("class", "legend-item")
            .attr("transform", (d, i) => `translate(0, ${i * 20})`);


        vis.legendItem.append("circle")
            .attr("r", 6)
            .attr("fill", d => vis.colorScale(d));


        vis.legendItem.append("text")
            .attr("x", 12)
            .attr("y", 4)
            .text(d => d || "Unknown Operator")
            .style("font-size", "12px")
            .style("fill", "#333");
                vis.wrangleData();
            }

    wrangleData() {
        let vis = this;

        vis.updateVis()
    }


    updateVis() {
        let vis = this;

        const sqftExtent = d3.extent(vis.displayData, d => d.sqft);

        vis.radiusScale = d3.scaleSqrt()
            .domain(sqftExtent)
            .range([1, 20]);


        // TODO: Add tooltips for each circle
        // TODO: Add Filters for data centers of certain size / company
        vis.g.selectAll(".plant-circle")
            .data(vis.displayData)
            .enter()
            .append("circle")
            .attr("class", "plant-circle")
            .attr("cx", d => {
            const coords = vis.projection([d.longitude, d.latitude]);
            return coords ? coords[0] : null;
        })
            .attr("cy", d => {
                const coords = vis.projection([d.longitude, d.latitude]);
                return coords ? coords[1] : null;
            })
            .attr("r", d => vis.radiusScale(d.sqft))
            .attr("fill", d => vis.colorScale(d.operator_grouped))
            .attr("opacity", 0.75)
    }
}