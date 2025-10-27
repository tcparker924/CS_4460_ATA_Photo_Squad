class ElectricityComparisonChart {

    // constructor method to initialize Timeline object
    constructor(parentElement, data) {
        this.parentElement = parentElement;
        this.circleColors = ['#b2182b', '#d6604d', '#f4a582', '#fddbc7'];
        this.imagesGenerated = 1000;
        this.data = data;
        this.displayData = data;
        this.ballRadius = 15;
        this.balls = [];
        this.displayPowerConsumptionMap = {};
        this.spawnToken = 0; // This cancnels the queue of balls when we swap toggles

        this.initVis();
    }

    initVis() {
        let vis = this;

        d3.selectAll('input[name="switchGroup"]').on("change", function () {
            if (this.checked) {
                const selected = this.id;

                switch (selected) {
                    case "1000_image_toggle":
                        vis.imagesGenerated = 1000;
                        vis.ballRadius = 15;
                        break;
                    case "100000_image_toggle":
                        vis.imagesGenerated = 100000;
                        vis.ballRadius = 8;
                        break;
                    case "34000000_image_toggle":
                        vis.imagesGenerated = 34000000;
                        vis.ballRadius = 6;
                        break;
                    case "12000000000_image_toggle":
                        vis.imagesGenerated = 12000000000;
                        vis.ballRadius = 3
                        break;
                }
            }

            vis.wrangleData()
        });

        vis.legend_width = document.getElementById("electricity-legend-area").getBoundingClientRect().width;
        vis.legend_height = document.getElementById("electricity-legend-area").getBoundingClientRect().height;

        vis.legend_svg = d3.select("#electricity-legend-area")
            .append("svg")
            .attr("width", vis.legend_width)
            .attr("height", vis.legend_height)
            .append("g")
            .attr("transform", `translate(${vis.ballRadius}, ${vis.ballRadius})`);


        // The following code is a mix of code from the examples listed
        // here: https://github.com/liabru/matter-js/blob/master/examples/avalanche.js
        // with adaptations to fit what we want it to do

        vis.margin = { top: 20, right: 20, bottom: 20, left: 20 };
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;


        var Engine = Matter.Engine,
            Render = Matter.Render,
            Runner = Matter.Runner,
            Composite = Matter.Composite,
            Bodies = Matter.Bodies;

        vis.engine = Engine.create();
        vis.engine.enableSleeping = true;
        vis.world = vis.engine.world;

        vis.render = Render.create({
            element: document.getElementById(vis.parentElement),
            engine: vis.engine,
            options: {
                width: vis.width,
                height: vis.height,
                showAngleIndicator: false,
                wireframes: false,
                background: "#ffffff",
                showSleeping: false
            }
        });

        Render.run(vis.render);
        vis.runner = Runner.create();
        Runner.run(vis.runner, vis.engine);

        const cupWidth = vis.width / 4;
        const cupHeight = vis.height - vis.margin.top - vis.margin.bottom;
        const cupY = vis.height - 50;
        const cupSpacing = vis.width / 4;
        const cupStartX = cupSpacing / 2;

        for (let i = 0; i < 4; i++) {
            const x = cupStartX + i * cupSpacing;
            Composite.add(vis.world, Bodies.rectangle(x, cupY, cupWidth, 30, { isStatic: true }));
            Composite.add(vis.world, Bodies.rectangle(x - cupWidth / 2, cupY - cupHeight / 2, 20, cupHeight, { isStatic: true }));
            Composite.add(vis.world, Bodies.rectangle(x + cupWidth / 2, cupY - cupHeight / 2, 20, cupHeight, { isStatic: true }));
        }

        vis.cupWidth = cupWidth;
        vis.cupHeight = cupHeight;
        vis.cupY = cupY;
        vis.cupSpacing = cupSpacing;
        vis.cupStartX = cupStartX;

        vis.cupLabelSvg = d3.select(`#${vis.parentElement}`)
            .append("svg")
            .attr("width", vis.width)
            .attr("height", 50)
            .attr("transform", (d, i) => `translate(0, ${-20})`);

        vis.wrangleData();
    }

    wrangleData() {
        let vis = this;

        vis.powerConsumedByImageGeneration = vis.imagesGenerated * vis.data[0].electricity;
        vis.powerConsumptionMap = {
            images: vis.powerConsumedByImageGeneration,
            light: Math.round(vis.powerConsumedByImageGeneration / vis.data[1].electricity),
            phone: Math.round(vis.powerConsumedByImageGeneration / vis.data[2].electricity),
            tv: Math.round(vis.powerConsumedByImageGeneration / vis.data[3].electricity),
            fridge: Math.round(vis.powerConsumedByImageGeneration / vis.data[4].electricity)
        };
        vis.displayPowerConsumptionMap = vis.powerConsumptionMap;
        switch(vis.imagesGenerated) {
            case 1000:
                vis.displayPowerConsumptionMap.light = vis.powerConsumptionMap.light
                vis.displayPowerConsumptionMap.phone = vis.powerConsumptionMap.phone / 10
                vis.displayPowerConsumptionMap.tv = vis.powerConsumptionMap.tv
                vis.displayPowerConsumptionMap.fridge = vis.powerConsumptionMap.fridge
                break;
            case 100000:
                vis.displayPowerConsumptionMap.light = vis.powerConsumptionMap.light / 7
                vis.displayPowerConsumptionMap.phone = vis.powerConsumptionMap.phone / 100
                vis.displayPowerConsumptionMap.tv = vis.powerConsumptionMap.tv / 7
                vis.displayPowerConsumptionMap.fridge = vis.powerConsumptionMap.fridge / 7
                break;
            case 34000000:
                vis.displayPowerConsumptionMap.light = vis.powerConsumptionMap.light / 365
                vis.displayPowerConsumptionMap.phone = vis.powerConsumptionMap.phone / 10000
                vis.displayPowerConsumptionMap.tv = vis.powerConsumptionMap.tv / 365
                vis.displayPowerConsumptionMap.fridge = vis.powerConsumptionMap.fridge / 365
                break;
            case 12000000000:
                vis.displayPowerConsumptionMap.light = vis.powerConsumptionMap.light / (365 * 100)
                vis.displayPowerConsumptionMap.phone = vis.powerConsumptionMap.phone / 1000000
                vis.displayPowerConsumptionMap.tv = vis.powerConsumptionMap.tv / (365 * 100)
                vis.displayPowerConsumptionMap.fridge = vis.powerConsumptionMap.fridge / (365 * 100)
                break;
        }

        vis.updateVis();
    }

    async updateVis() {
        let vis = this;

        let legendLabels = []
        let cupLabels = [`${Math.round(vis.displayPowerConsumptionMap.light)} light bulbs`,
            `${Math.round(vis.displayPowerConsumptionMap.phone)} phones`,
            `${Math.round(vis.displayPowerConsumptionMap.tv)} TVs`,
            `${Math.round(vis.displayPowerConsumptionMap.fridge)} refrigerators`
        ];

        switch(vis.imagesGenerated) {
            case 100000:
                legendLabels = ["Energy to burn a lightbulb for 1 week",
                    "Energy to charge 100 iPhones to full",
                    "Energy to run a TV for 1 week", "Energy to run a Fridge for 1 week"];
                break;
            case 34000000:
                legendLabels = ["Energy to burn a lightbulb for 1 year",
                    "Energy to charge 10,000 iPhones to full",
                    "Energy to run a TV for 1 year", "Energy to run a Fridge for 1 year"];
                break;
            case 12000000000:
                legendLabels = ["Energy to burn a lightbulb for 100 years",
                    "Energy to charge 1,000,000 iPhones to full",
                    "Energy to run a TV for 100 years", "Energy to run a Fridge for 100 years"];
                break;
            default:
                legendLabels = ["Energy to burn a lightbulb for 1 day",
                    "Energy to charge 10 iPhones to full",
                    "Energy to run a TV for 1 day", "Energy to run a Fridge for 1 day"];
                break;
        }

        let legend = vis.legend_svg.selectAll(".legend-item")
            .data(legendLabels);

        legend.exit().remove();

        let legendEnter = legend.enter()
            .append("g")
            .attr("class", "legend-item")
            .attr("transform", (d, i) => `translate(0, ${i * 60})`);

        legendEnter.append("circle")
            .attr("r", vis.ballRadius)
            .attr("cx", 0)
            .attr("cy", 0)
            .style("fill", (d, i) => vis.circleColors[i]);

        legendEnter.append("text")
            .attr("x", 2 * vis.ballRadius)
            .attr("y", 4)
            .style("font-size", "14px")
            .text(d => ("=" + d));

        let legendMerge = legendEnter.merge(legend);
        legendMerge.select("circle")
            .transition()
            .duration(500)
            .attr("r", vis.ballRadius)
            .style("fill", (d, i) => vis.circleColors[i]);

        legendMerge.select("text")
            .transition()
            .duration(500)
            .attr("x", 2 * vis.ballRadius)
            .text(d => ("= " + d));

        let cupLabelsSvg =  vis.cupLabelSvg.selectAll("text")
            .data(cupLabels)

        cupLabelsSvg.exit().remove();

        cupLabelsSvg.enter()
            .append("text")
            .attr("x", (d, i) => vis.cupStartX + i * vis.cupSpacing)
            .attr("y", 20)
            .attr("text-anchor", "middle")
            .style("font-size", "14px")
            .attr("fill", (d, i) => vis.circleColors[i])
            .text(d => d)
            .merge(cupLabelsSvg)
            .transition()
            .duration(500)
            .text(d => d)
            .attr("x", (d, i) => vis.cupStartX + i * vis.cupSpacing)
            .attr("fill", (d, i) => vis.circleColors[i]);

        const Composite = Matter.Composite;
        const Bodies = Matter.Bodies;

        const currentSpawnToken = ++vis.spawnToken;

        if (vis.balls.length > 0) {
            for (let ball of vis.balls) {
                Composite.remove(vis.world, ball);
            }
            vis.balls = [];
        }

        const colors = vis.circleColors;
        const promises = [];

        let cupIndex = 0;

        for (const [key, value] of Object.entries(vis.displayPowerConsumptionMap)) {
            if (key === 'images') continue;

            const currentCupIndex = cupIndex;
            const dropX = vis.cupStartX + currentCupIndex * vis.cupSpacing;

            const spawnBalls = async () => {
                for (let i = 0; i < value; i++) {
                    if (currentSpawnToken !== vis.spawnToken) {
                        return;
                    }

                    const dropY = 30 + Math.random() * 10;

                    const ball = Bodies.circle(dropX + (Math.random() * 50 - 5), dropY, vis.ballRadius, {
                        restitution: 0.0,
                        friction: 0,
                        density: 0.05,
                        frictionAir: 0.001,
                        render: { fillStyle: colors[currentCupIndex % colors.length] },
                    });

                    vis.balls.push(ball);
                    Composite.add(vis.world, ball);

                    await new Promise(resolve => setTimeout(resolve, 10));
                }
            };

            promises.push(spawnBalls());
            cupIndex++;
        }

        await Promise.all(promises);

    }

}