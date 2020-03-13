// Read samples.json
const data = d3.json("./data/samples.json");

// use d3 to select drop down menu
var dropDownMenu = d3.select("#selDataset");
// Populate dropdown menu with test subject names
data.then((d) => {
    d.names.forEach(n => dropDownMenu.append("option").text(n));
}).catch(error => console.log("can't fetch", error));


/**
 * Update demographic info using metadata
 * @param {*} subjectID Test Subject ID
 */
function updateDemographicInfo(subjectID) {
    // Remove contents in sample-metadata div
    let divMetadata = d3.select("#sample-metadata");
    divMetadata.selectAll("p").remove();

    // Find metadata for selected test subject id
    data.then((d) => {
        let filteredMetadata = d.metadata.filter(i => i.id == subjectID);
        filteredMetadata.forEach(md => {
            Object.entries(md).forEach(([key, value]) => {
                // Add contents as paragraphs
                divMetadata.append("p").html(`${key}: ${value}`);
            });
        });

    });
}


/**
 * Update bar chart using sample data
 * @param {*} id Test Subject ID 
 */
function updateBarChart(subjectID) {
    data.then((d) => {
        let filteredSamples = d.samples.filter(i => i.id === subjectID);

        // Bar Chart
        let trace = [{
            x: filteredSamples[0].sample_values
                .slice(0,10)
                .reverse(),
            y: filteredSamples[0].otu_ids
                .slice(0,10)
                .reverse()
                .map(r => "OTU " + r),
            type: "bar",
            orientation: "h"
        }];

        let layout = {
            title: "<b>Top 10 OTUs</b>",
            font: { size: 14 },
            xaxis: { title: "Sequencing Read Numbers" },
            margin: {t:50}
        }

        let config = { responsive: true };

        Plotly.newPlot("bar", trace, layout, config);
    });
};


/**
 * Update bubble chart using sample data
 * @param {*} id Test Subject ID 
 */
function updateBubbleChart(subjectID) {
    data.then((d) => {
        let filteredSamples = d.samples.filter(i => i.id === subjectID);

        let trace = [{
            x: filteredSamples[0].otu_ids,
            y: filteredSamples[0].sample_values,
            mode: "markers",
            marker: {
                size: filteredSamples[0].sample_values,
                sizemode: "area",
                sizeref: 0.2,
                color: filteredSamples[0].otu_ids,
                colorscale: 'Portland',
                opacity: 0.8
            },
            text: filteredSamples[0].otu_labels
        }]

        let layout = {
            title: "<b>All OTU Counts</b>",
            font: { size: 14 },
            xaxis: { title: "OTU ID" },
            yaxis: { title: "Sequencing Read Numbers" },
            margin: {t:30}
        }

        let config = { responsive: true };

        Plotly.newPlot("bubble", trace, layout, config);
        
    });
};


/**
 * Update gauge chart using metadata
 * @param {*} subjectID Test Subject ID 
 */
function updateGaugeChart(subjectID) {
    data.then((d) => {
        let filteredMetadata = d.metadata.filter(i => i.id == subjectID);
        
        var trace = [
            {
              domain: { x: [0, 1], y: [0, 1] },
              value: +filteredMetadata[0].wfreq,
              title: { 
                  text: "Scrubs per Week",
                  font: { size: 18 } 
                },
              type: "indicator",
              mode: "gauge+number",
              gauge: {
                axis: { range: [0, 9] },
                steps: [
                  { range: [0, 1], color: "rgba(255, 255, 255, 0)" },
                  { range: [1, 2], color: "rgba(232, 226, 202, 0.5)" },
                  { range: [2, 3], color: "rgba(210, 206, 145, 0.5)" },
                  { range: [3, 4], color: "rgba(202, 209, 95, 0.5)" },
                  { range: [4, 5], color: "rgba(170, 202, 42, 0.5)" },
                  { range: [5, 6], color: "rgba(110, 154, 22, 0.5)" },
                  { range: [6, 7], color: "rgba(14, 127, 0, 0.5)" },
                  { range: [7, 8], color: "rgba(0, 102, 0, 0.5)" },
                  { range: [8, 9], color: "rgba(0, 51, 0, 0.5)" }
                ],

              }
            }
          ];
          
          var layout = {
              title: "<b>Belly Button Washing Frequency</b>",
              font: { size: 14 }
            };

          let config = { responsive: true };

          Plotly.newPlot('gauge', trace, layout, config);

    });
};

function pageRefresh() {
    data.then((d)=> {
        // selected test subject id
        let selectedID = dropDownMenu.property("value");

        // update demographic info
        updateDemographicInfo(selectedID);

        // update chart
        updateBarChart(selectedID);

        // bubble chart
        updateBubbleChart(selectedID);

        // gauge chart
        updateGaugeChart(selectedID);

    });
};

// On call listener for dropdown menu
dropDownMenu.on("change", pageRefresh);

// When page first loads, plot with first option in menu
pageRefresh();