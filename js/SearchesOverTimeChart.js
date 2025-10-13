class SearchesOverTimeChart {


    constructor(parentElement, data) {
        this.parentElement = parentElement;
        this.data = data;
        this.displayData = data;
        this.displayed_data = [1, 0, 0, 0];

        this.initVis();
    }


    initVis() {
        let vis = this;

        d3.selectAll('#search-filter-buttons input[type="checkbox"]')
            .on('change', function() {
                const selectedCategories = d3.selectAll('#search-filter-buttons input[type="checkbox"]:checked')
                    .nodes()
                    .map(cb => cb.id);

                if (selectedCategories.includes("image_generator_check")) {
                    vis.displayed_data[0] = 1
                } else {
                    vis.displayed_data[0] = 0
                }

                if (selectedCategories.includes("ai_faces_check")) {
                    vis.displayed_data[1] = 1
                } else {
                    vis.displayed_data[1] = 0
                }

                if (selectedCategories.includes("photo_maker_check")) {
                    vis.displayed_data[2] = 1
                } else {
                    vis.displayed_data[2] = 0
                }

                if (selectedCategories.includes("ai_images_check")) {
                    vis.displayed_data[3] = 1
                } else {
                    vis.displayed_data[3] = 0
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

        Object.entries(this.data).forEach(([key, value]) => {
            this.displayData[key] = this.data[key].filter(d => d.date > new Date("2019-01-01"));;
        });

        vis.updateVis();
    }

    updateVis() {
        let vis = this;

        const dataKeys = Object.keys(vis.displayData);
        const activeKeys = dataKeys.filter((key, i) => vis.displayed_data[i] === 1);

        vis.x.domain(d3.extent(vis.displayData["ai-image-generator-data"], d => d.date));
        vis.y.domain([0, d3.max(vis.displayData["ai-image-generator-data"], d => d.value)]);

        vis.svg.select(".x-axis").call(vis.xAxis);
        vis.svg.select(".y-axis").call(vis.yAxis);

        const lines = vis.svg.selectAll(".trend-line")
            .data(activeKeys, d => d);

        lines.exit().remove();

        lines.transition()
            .duration(1000)
            .attr("d", d => vis.line(vis.displayData[d]));

        const colorMap = {
            "ai-image-generator-data": "#1f77b4",
            "ai-faces-data": "#ff7f0e",
            "ai-photo-maker-data": "#2ca02c",
            "ai-image-maker-data": "#d62728"
        };

        let enteringLines = lines.enter()
            .append("path")
            .attr("class", "trend-line")
            .attr("fill", "none")
            .attr("stroke", d => colorMap[d])
            .each(d => console.log(colorMap[d]))
            .attr("stroke-width", 4)
            .attr("d", d => vis.line(vis.displayData[d]))
            .attr("stroke-dasharray", function() {
                const length = this.getTotalLength();
                return length + " " + length;
            })
            .attr("stroke-dashoffset", function() {
                return this.getTotalLength();
            });

        if (!enteringLines.empty()) {
            setFilterButtonsDisabled(true);

            enteringLines
                .transition()
                .duration(1250)
                .ease(d3.easeLinear)
                .attr("stroke-dashoffset", 0)
                .on("end", () => {
                    setFilterButtonsDisabled(false);
                });
        }

        // Helper function to make sure users can't interupt the line drawing
        function setFilterButtonsDisabled(disabled) {
            d3.selectAll('#search-filter-buttons input[type="checkbox"]')
                .property('disabled', disabled);
        }
    }

}
