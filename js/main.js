loadData();

function loadData() {
    d3.json("data/{data_placeholder}.json"). then(jsonData=>{

        // prepare data
        let data = prepareData(jsonData)

        console.log('data loaded ')


        // Now we will instatinate our charts, the following code is just an example:


        // areachart = new StackedAreaChart("stacked-area-chart", data.layers)
        // timeline = new Timeline("timeline", data.years)
        // timeline.brushed = brushed;
        //
        // areachart.initVis();
        // timeline.initVis()

    });
}



function prepareData(data){
    // Do any transformations needed for the data


    return data
}
