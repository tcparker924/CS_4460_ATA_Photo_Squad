loadSearchTrendsData();

let searchesOverTimeChart;

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

function prepareSearchTrendData(data) {
    const parseTime = d3.utcParse("%Y-%m");
    return data.map(d => {
        return {
            date: parseTime(d.Month),
            value: parseLessThanValues(d.Value)
        };
    });
}



function parseLessThanValues(val) {
    if (val === "<1") return 0.5;
    let num = +val;
    return isNaN(num) ? 0 : num;
}
