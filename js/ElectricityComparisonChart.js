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