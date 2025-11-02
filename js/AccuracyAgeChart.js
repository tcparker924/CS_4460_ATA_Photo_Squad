class AccuracyAgeChart {

    constructor(parentElement, data) {
        this.parentElement = parentElement;
        this.data = data;
        this.displayData = data;
        this.initVis();
    }

    initVis() {
        let vis = this;

        // Margins and size
        vis.margin = { top: 10, right: 50, bottom: 10, left: 50 };
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;
        if (vis.height < 200) vis.height = 500;

        // SVG container
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", `translate(${vis.margin.left},${vis.margin.top})`);

        // Title
        vis.svg.append("text")
            .attr("class", "title target-chart")
            .attr("x", vis.width / 2)
            .attr("y", 20)
            .attr("text-anchor", "middle")
            .text("Accuracy Versus Age");

        // Tooltip
        vis.tooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);

        // Chart group (centered)
        vis.chartGroup = vis.svg.append("g")
            .attr("transform", `translate(${vis.width / 2},${vis.height / 2})`);

        // Target parameters
        vis.ringCount = 5;
        vis.maxRadius = Math.min(vis.width, vis.height) / 2.5;
        vis.ringThickness = vis.maxRadius / vis.ringCount;
        vis.colors = ["#c83737ff", "#ffffff"];

        // Draw rings
        for (let i = 0; i < vis.ringCount; i++) {
            vis.chartGroup.append("circle")
                .attr("r", vis.maxRadius - i * vis.ringThickness)
                .attr("fill", vis.colors[i % 2]);
        }

        // Arrowhead marker
        let defs = vis.chartGroup.append("defs");
        defs.append("marker")
            .attr("id", "arrowhead")
            .attr("viewBox", "0 -5 10 10")
            .attr("refX", 10)
            .attr("refY", 0)
            .attr("markerWidth", 6)
            .attr("markerHeight", 6)
            .attr("orient", "auto")
            .append("path")
            .attr("d", "M0,-5L10,0L0,5")
            .attr("fill", "black");

        // Wrangle data
        this.wrangleData();
    }

    wrangleData() {
        let vis = this;

        // Convert numbers & ensure age_group exists
        vis.displayData = vis.data.map(d => ({
            age_group: d.age_group ? d.age_group.replace(/\s+/g, ' ').trim() : "",
            ai: +d.ai,
            real: +d.real
        }));

        // Compute angles for each age group
        let ageGroups = vis.displayData.map(d => d.age_group);
        vis.angleScale = d3.scalePoint()
            .domain(ageGroups)
            .range([0, 2 * Math.PI]);

        vis.updateVis();
    }

    updateVis() {
        let vis = this;

        // Map accuracy to radius
        function accuracyToRadius(acc) {
            const minRadius = 10;
            return minRadius + (vis.maxRadius - minRadius) * (1 - acc / 100);
        }

        const arrowLength = 150;
        const aiOffset = 5;
        const realOffset = 15;
        const groupOffset = 7.5;

        // Compute arrow start/end
        function computeEnd(radius, angle, offset = 0) {
            const finalAngle = angle + offset;
            const xStart = radius * Math.cos(finalAngle);
            const yStart = radius * Math.sin(finalAngle);
            const xEnd = xStart + arrowLength * Math.cos(finalAngle);
            const yEnd = yStart + arrowLength * Math.sin(finalAngle);
            return { xStart, yStart, xEnd, yEnd };
        }

        // AI arrows
        let aiArrows = vis.chartGroup.selectAll(".arrow-ai")
            .data(vis.displayData);

        aiArrows.enter()
            .append("line")
            .attr("class", "arrow-ai")
            .merge(aiArrows)
            .attr("x2", (d, i) => computeEnd(accuracyToRadius(d.ai), vis.angleScale(d.age_group), -groupOffset - i * aiOffset).xStart)
            .attr("y2", (d, i) => computeEnd(accuracyToRadius(d.ai), vis.angleScale(d.age_group), -groupOffset - i * aiOffset).yStart)
            .attr("x1", (d, i) => computeEnd(accuracyToRadius(d.ai), vis.angleScale(d.age_group), -groupOffset - i * aiOffset).xEnd)
            .attr("y1", (d, i) => computeEnd(accuracyToRadius(d.ai), vis.angleScale(d.age_group), -groupOffset - i * aiOffset).yEnd)
            .attr("stroke", "red")
            .attr("stroke-width", 2)
            .attr("marker-end", "url(#arrowhead)")
            .on("mouseover", (event, d) => {
                vis.tooltip
                    .style("opacity", 1)
                    .style("left", event.pageX + 10 + "px")
                    .style("top", event.pageY + 10 + "px")
                    .html(`<strong>Age:</strong> ${d.age_group}<br><strong>AI Accuracy:</strong> ${d.ai}%`);
            })
            .on("mouseout", () => {
                vis.tooltip.style("opacity", 0);
            });
            

        aiArrows.exit().remove();

        // Real arrows
        let realArrows = vis.chartGroup.selectAll(".arrow-real")
            .data(vis.displayData);

        realArrows.enter()
            .append("line")
            .attr("class", "arrow-real")
            .merge(realArrows)
            .attr("x2", (d, i) => computeEnd(accuracyToRadius(d.real), vis.angleScale(d.age_group), groupOffset + i * realOffset).xStart)
            .attr("y2", (d, i) => computeEnd(accuracyToRadius(d.real), vis.angleScale(d.age_group), groupOffset + i * realOffset).yStart)
            .attr("x1", (d, i) => computeEnd(accuracyToRadius(d.real), vis.angleScale(d.age_group), groupOffset + i * realOffset).xEnd)
            .attr("y1", (d, i) => computeEnd(accuracyToRadius(d.real), vis.angleScale(d.age_group), groupOffset + i * realOffset).yEnd)
            .attr("stroke", "blue")
            .attr("stroke-width", 2)
            .attr("marker-end", "url(#arrowhead)")
            .on("mouseover", (event, d) => {
                vis.tooltip
                    .style("opacity", 1)
                    .style("left", event.pageX + 10 + "px")
                    .style("top", event.pageY + 10 + "px")
                    .html(`<strong>Age:</strong> ${d.age_group}<br><strong>Real Accuracy:</strong> ${d.real}%`);
            })
            .on("mouseout", () => {
                vis.tooltip.style("opacity", 0);
            });

        realArrows.exit().remove();

        
    }

}
