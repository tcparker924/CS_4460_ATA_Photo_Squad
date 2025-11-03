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
        // Legend
        const legendData = [
            { label: "AI Accuracy", color: "#3889edff" },
            { label: "Real Accuracy", color: "#f7902fff" }
        ];

        const legend = vis.svg.append("g")
            .attr("class", "legend")
            .attr("transform", `translate(${vis.width / 2 + 80}, 40)`); // slightly below title

        legend.selectAll("rect")
            .data(legendData)
            .enter()
            .append("rect")
            .attr("x", (d, i) => i * 130)  // horizontal spacing
            .attr("y", 0)
            .attr("width", 18)
            .attr("height", 18)
            .attr("fill", d => d.color)
            .attr("stroke", "black")
            .attr("stroke-width", 0.5);

        legend.selectAll("text.legend-label")
            .data(legendData)
            .enter()
            .append("text")
            .attr("class", "legend-label")
            .attr("x", (d, i) => i * 130 + 25)
            .attr("y", 14)
            .text(d => d.label)
            .attr("font-size", "14px")
            .attr("alignment-baseline", "middle");

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

        const arrowLength = 90;
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
        ["ai", "real"].forEach((type, typeIndex) => {
            const color = type === "ai" ? "#3889edff" : "#f7902fff";
            const data = vis.displayData;

            let darts = vis.chartGroup.selectAll(`.dart-${type}`).data(data);

            const dartEnter = darts.enter()
                .append("path")
                .attr("class", `dart-${type}`)
                .attr("fill", color)
                .attr("stroke", "black")
                .attr("stroke-width", 0.8)
                .attr("opacity", 0.9);

            darts = dartEnter.merge(darts);

        darts.each(function(d, i) {
            const baseAngle = vis.angleScale(d.age_group);

            const dartsPerType = 4;
            const spread = 50;

            const baseOffsetDeg = -spread/2 + (i % dartsPerType) * (spread / (dartsPerType - 1));
            const randomJitterDeg = (Math.random() - 0.5) * 10;

            let angle = baseAngle + (typeIndex === 0 ? Math.PI : 0); // AI mirrored
            angle += (typeIndex === 0 ? -1 : 1) * (baseOffsetDeg + randomJitterDeg) * Math.PI / 180;

            const accuracy = type === "ai" ? d.ai : d.real;
            const baseRadius = accuracyToRadius(accuracy);

            const dartLength = 130;
            const dartWidth = 6;
            const bodyLength = dartLength * 0.7;
            const tailLength = dartLength * 0.3;
            const halfWidth = dartWidth / 2;

            // Tip at (0,0), tail extends in +X direction
            const pathData = `
                M 0,0
                L ${bodyLength},${-halfWidth}
                L ${bodyLength + 6},0
                L ${bodyLength},${halfWidth}
                L 0,${halfWidth}
                L ${tailLength * 0.2},${halfWidth * 2}
                L ${tailLength},${halfWidth}
                L ${tailLength},${-halfWidth}
                L ${tailLength * 0.2},${-halfWidth * 2}
                Z
            `;

            d3.select(this)
                .attr("d", pathData)
                .attr("transform", () => {
                    const xTip = baseRadius * Math.cos(angle);
                    const yTip = baseRadius * Math.sin(angle);
                    const rotation = (angle * 180 / Math.PI);
                    return `translate(${xTip}, ${yTip}) rotate(${rotation})`;
                })
                .on("mouseover", (event, datum) => {
                    vis.tooltip
                        .style("opacity", 1)
                        .style("left", event.pageX + 10 + "px")
                        .style("top", event.pageY + 10 + "px")
                        .html(`
                            <strong>Age:</strong> ${datum.age_group}<br>
                            <strong>${type === "ai" ? "AI" : "Real"} Accuracy:</strong> ${accuracy}%
                        `);
                })
                .on("mouseout", () => vis.tooltip.style("opacity", 0));
                }); 


            darts.exit().remove();
        });
    
    }

}
