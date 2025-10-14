loadSearchTrendsData();
loadGenerationRateOverTimeData();
loadUSDataCenterData();

let searchesOverTimeChart;
let generationRateOverTimeChart;
let dataCenterMapChart;

function loadSearchTrendsData() {
    d3.csv("data/search-trends-ai-image-generator.csv").then(csvData1 => {
        d3.csv("data/search-trends-ai-faces.csv").then(csvData2 => {
            d3.csv("data/search-trends-ai-images.csv").then(csvData3 => {
                d3.csv("data/search-trends-ai-photo-maker.csv").then(csvData4 => {
                    let searchTrendData ={
                        "ai-image-generator-data": prepareSearchTrendData(csvData1),
                        "ai-faces-data": prepareSearchTrendData(csvData2),
                        "ai-image-maker-data": prepareSearchTrendData(csvData3),
                        "ai-photo-maker-data": prepareSearchTrendData(csvData4)
                    };

                    console.log('Data loaded', searchTrendData);

                    searchesOverTimeChart = new SearchesOverTimeChart("searches-over-time-area", searchTrendData);
                });
            });
        });
});
}

function loadGenerationRateOverTimeData() {
    d3.csv("data/ai-image-totals-per-year.csv").then(csvData => {
        console.log('Data loaded', csvData);

        generationRateOverTimeChart = new GenerationRateOverTimeChart("generation-rate-over-time-area", prepareGenerationRateOverTimeData(csvData));
    });

}

function loadUSDataCenterData() {
    Promise.all([
        d3.csv("data/im3_open_source_data_center_atlas.csv"),
        d3.json("data/counties-10m.json")
    ]).then(([csvData, worldData]) => {
        dataCenterMapChart = new DataCenterMapChart("data-center-map-area", prepareDataCenterMapChart(csvData), worldData);
    });
}

function prepareSearchTrendData(data) {
    const parseTime = d3.utcParse("%Y-%m");
    return data.map(d => {
        return {
            date: parseTime(d.Month),
            value: parseLessThanValues(d.Value)
        };
    });
}

function prepareGenerationRateOverTimeData(data) {
    console.log(data);
    const parseTime = d3.utcParse("%Y");
    return data.map(d => {
        return {
            date: parseTime(d.Year),
            value: (d.Value)
        };
    });
}

function prepareDataCenterMapChart(data) {
    return data.map(d => ({
        state: d.state,
        county: d.county,
        operator: d.operator,
        name: d.name,
        longitude: +d.lon,
        latitude: +d.lat,
        sqft: +d.sqft,
        type: d.type
    }));
}



function parseLessThanValues(val) {
    if (val === "<1") return 0.5;
    let num = +val;
    return isNaN(num) ? 0 : num;
}
