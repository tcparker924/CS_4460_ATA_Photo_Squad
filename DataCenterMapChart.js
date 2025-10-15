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

        //Color Coding for operators
        vis.operators = [...new Set(vis.data.map(d => d.operator))];
        vis.colorScale = d3.scaleOrdinal()
            .domain(vis.operators)
            .range(vis.operators.map((_, i) => d3.interpolateRainbow(i / vis.operators.length)));
        
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
        // TODO: Add Legend for size (?)
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
            .attr("fill", d => vis.colorScale(d.operator))
            .attr("opacity", 0.75)
    }
}