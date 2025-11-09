class AccuracyAgeChart {

    constructor(parentElement, data) {
        this.parentElement = parentElement;
        this.data = data;
        this.displayData = data;
        this.ageIndex = 0;

        this.initVis();
    }

    initVis() {
        let vis = this;

        d3.selectAll('input[name="switchGroupAccuracy"]').on("change", function () {
            if (this.checked) {
                const selected = this.id;

                switch (selected) {
                    case "ages_18_29":
                        vis.ageIndex = 0;
                        break;
                    case "ages_30_44":
                        vis.ageIndex = 1;
                        break;
                    case "ages_45_64":
                        vis.ageIndex = 2;
                        break;
                    case "ages_65":
                        vis.ageIndex = 3;
                        break;
                }
            }

            vis.wrangleData()
        });

        vis.margin = { top: 10, right: 50, bottom: 10, left: 50 };
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;

        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", `translate(${vis.margin.left},${vis.margin.top})`);

        vis.svg.append("text")
            .attr("class", "title target-chart")
            .attr("x", vis.width / 2)
            .attr("y", 20)
            .attr("text-anchor", "middle")
            .text("Accuracy Versus Age");

        vis.legendSvg = d3.select("#accuracy-versus-age-toggle")
            .append("svg")
            .attr("width", 200)
            .attr("height", 100)
            .append("g")
            .attr("transform", "translate(0,0)");

        const legend = vis.legendSvg.append("g")
            .attr("class", "legend")
            .attr("transform", `translate(0, 40)`);

        const legendData = [
            { color: "#d1814b", label: "AI Image Accuracy" },
            { color: "#4b9cd3", label: "Real Image Accuracy" }
        ];

        legend.selectAll("rect")
            .data(legendData)
            .enter()
            .append("rect")
            .attr("x", 0)
            .attr("y", (d, i) => i * 30)
            .attr("width", 18)
            .attr("height", 18)
            .attr("fill", d => d.color)

        legend.selectAll("text.legend-label")
            .data(legendData)
            .enter()
            .append("text")
            .attr("class", "legend-label")
            .attr("x", 25)
            .attr("y", (d, i) => i * 30 + 10)
            .text(d => d.label)
            .attr("font-size", "14px")
            .attr("alignment-baseline", "middle");

        vis.tooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("position", "absolute")
            .style("background-color", "white")
            .style("border", "1px solid #999")
            .style("padding", "5px 10px")
            .style("border-radius", "4px")
            .style("pointer-events", "none")
            .style("opacity", 0);

        vis.chartGroup = vis.svg.append("g")
            .attr("transform", `translate(${vis.width / 2},${vis.height / 2})`);

        vis.ringCount = 5;
        vis.maxRadius = Math.min(vis.width, vis.height) / 2.5;
        vis.ringThickness = vis.maxRadius / vis.ringCount;
        vis.colors = ["#c83737ff", "#ffffff"];

        for (let i = 0; i < vis.ringCount; i++) {
            vis.chartGroup.append("circle")
                .attr("r", vis.maxRadius - i * vis.ringThickness)
                .attr("fill", vis.colors[i % 2]);

            vis.chartGroup.append("text")
                .attr("x", -1 * (vis.maxRadius - i * vis.ringThickness) + 15)  // 5px padding from the left edge
                .attr("y", 0)
                .attr("text-anchor", "start")
                .attr("alignment-baseline", "middle")
                .attr("fill", i % 2 === 0 ? "#ffffff" : "#c83737ff") // contrast
                .attr("font-size", "5px")
                .text(`${25 * (i)}%`);
        }


        this.wrangleData();
    }

    wrangleData() {
        let vis = this;

        vis.displayData = vis.data.map(d => ({
            age_group: d.age_group ? d.age_group.replace(/\s+/g, ' ').trim() : "",
            ai: +d.ai,
            real: +d.real
        }));

        console.log(vis.displayData);

        vis.updateVis();
    }

    updateVis() {
        let vis = this;

        vis.chartGroup.selectAll("image").remove();

        let dartCenterXPos = 0;
        let dartCenterYPos = 0;

        let aiAccuracy = vis.displayData[vis.ageIndex].ai;
        let realAccuracy = vis.displayData[vis.ageIndex].real;

        let aiAngle = Math.random() * 2 * Math.PI;
        let realAngle = Math.random() * 2 * Math.PI;

        let aiTargetX = (1 - aiAccuracy / 100) * vis.maxRadius * Math.cos(aiAngle);
        let aiTargetY = (1 - aiAccuracy / 100) * vis.maxRadius * Math.sin(aiAngle);

        let realTargetX = (1 - realAccuracy / 100) * vis.maxRadius * Math.cos(realAngle);
        let realTargetY = (1 - realAccuracy / 100) * vis.maxRadius * Math.sin(realAngle);

        let aiAngleDeg = Math.atan2(dartCenterYPos - aiTargetY, dartCenterXPos - aiTargetX) * 180 / Math.PI - 90;
        let realAngleDeg = Math.atan2(dartCenterYPos - realTargetY, dartCenterXPos - realTargetX) * 180 / Math.PI - 90;

        let aiStartX = aiTargetX + 600 * Math.cos(aiAngle);
        let aiStartY = aiTargetY + 600 * Math.sin(aiAngle);

        let realStartX = realTargetX + 600 * Math.cos(realAngle);
        let realStartY = realTargetY + 600 * Math.sin(realAngle);

        vis.chartGroup.append("image")
            .attr("xlink:href", "resources/dart_ai_accuracy_color.png")
            .attr("width", 60)
            .attr("height", 150)
            .attr("x", aiStartX - 30)
            .attr("y", aiStartY - 150)
            .attr("transform", `rotate(${aiAngleDeg}, ${aiStartX}, ${aiStartY})`)
            .on("mouseover", function (event) {
                vis.tooltip.transition().duration(200).style("opacity", 0.9);
                vis.tooltip.html(`Accuracy of correctly identifying a photo as AI generated: ${aiAccuracy}%`)
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 20) + "px");
            })
            .on("mouseout", function () {
                vis.tooltip.transition().duration(200).style("opacity", 0);
            })
            .transition()
            .duration(300)
            .ease(d3.easeCubicOut)
            .attr("x", aiTargetX - 30)
            .attr("y", aiTargetY - 150)
            .attr("transform", `rotate(${aiAngleDeg}, ${aiTargetX}, ${aiTargetY})`);

        vis.chartGroup.append("image")
            .attr("xlink:href", "resources/dart_human_accuracy_color.png")
            .attr("width", 60)
            .attr("height", 150)
            .attr("x", realStartX - 30)
            .attr("y", realStartY - 150)
            .attr("transform", `rotate(${realAngleDeg}, ${realStartX}, ${realStartY})`)
            .on("mouseover", function (event) {
                vis.tooltip.transition().duration(200).style("opacity", 0.9);
                vis.tooltip.html(`Accuracy of correctly identifying a photo as real: ${realAccuracy}%`)
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 20) + "px");
            })
            .on("mouseout", function () {
                vis.tooltip.transition().duration(200).style("opacity", 0);
            })
            .transition()
            .duration(300)
            .ease(d3.easeCubicOut)
            .attr("x", realTargetX - 30)
            .attr("y", realTargetY - 150)
            .attr("transform", `rotate(${realAngleDeg}, ${realTargetX}, ${realTargetY})`);
    }


}