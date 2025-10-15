class ElectricityComparisonChart {

    // constructor method to initialize Timeline object
    constructor(parentElement, data) {
        this.parentElement = parentElement;
        this.circleColors = ['#b2182b', '#d6604d', '#f4a582', '#fddbc7'];
        this.imagesGenerated = 1000;
        this.data = data;
        this.displayData = data;
        this.ballRadius = 10;
        this.balls = [];
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
                        vis.ballRadius = 10;
                        break;
                    case "100000_image_toggle":
                        vis.imagesGenerated = 100000;
                        vis.ballRadius = 3;
                        break;
                    case "34000000_image_toggle":
                        vis.imagesGenerated = 34000000;
                        vis.ballRadius = 1;
                        break;
                    case "100000000_image_toggle":
                        vis.imagesGenerated = 100000000;
                        vis.ballRadius = 0.5;
                        break;
                    case "12000000000_image_toggle":
                        vis.imagesGenerated = 12000000000;
                        vis.ballRadius = 0.1
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
        vis.world = vis.engine.world;

        vis.render = Render.create({
            element: document.getElementById(vis.parentElement),
            engine: vis.engine,
            options: {
                width: vis.width,
                height: vis.height,
                showAngleIndicator: false,
                wireframes: false,
                background: "#ffffff"
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
            Composite.add(vis.world, Bodies.rectangle(x, cupY, cupWidth, 10, { isStatic: true }));
            Composite.add(vis.world, Bodies.rectangle(x - cupWidth / 2, cupY - cupHeight / 2, 10, cupHeight, { isStatic: true }));
            Composite.add(vis.world, Bodies.rectangle(x + cupWidth / 2, cupY - cupHeight / 2, 10, cupHeight, { isStatic: true }));
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
            phone: Math.round(vis.powerConsumedByImageGeneration / vis.data[2].electricity / 10),
            tv: Math.round(vis.powerConsumedByImageGeneration / vis.data[3].electricity),
            fridge: Math.round(vis.powerConsumedByImageGeneration / vis.data[4].electricity)
        };

        vis.updateVis();
    }

    updateVis() {
        let vis = this;
        const Composite = Matter.Composite;
        const Bodies = Matter.Bodies;

        if (vis.balls.length > 0) {
            for (let ball of vis.balls) {
                Composite.remove(vis.world, ball);
            }
            vis.balls = [];
        }

        const colors = vis.circleColors;
        let cupIndex = 0;

        for (const [key, value] of Object.entries(vis.powerConsumptionMap)) {
            if (key === 'images') continue;

            const dropX = vis.cupStartX + cupIndex * vis.cupSpacing + (Math.random() * 10 - 5);

            for (let i = 0; i < value; i++) {
                const dropY = 50 + Math.random() * 10;

                const ball = Bodies.circle(dropX, dropY, vis.ballRadius, {
                    restitution: 0.5,
                    friction: 0.0001,
                    density: 0.001,
                    render: { fillStyle: colors[cupIndex % colors.length] }
                });

                vis.balls.push(ball);
            }

            cupIndex++;
        }

        Composite.add(vis.world, vis.balls);

        Matter.Render.lookAt(vis.render, Composite.allBodies(vis.world));
    }
}