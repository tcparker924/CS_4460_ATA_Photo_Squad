loadData();

let searchesOverTimeChart;

function loadData() {
    d3.csv("data/search-trends-ai-image-generator.csv").then(csvData => {

        let searchTrendData = prepareSearchTrendData(csvData);

        console.log('Data loaded', searchTrendData);

        searchesOverTimeChart = new SearchesOverTimeChart("searches-over-time-area", searchTrendData);
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
