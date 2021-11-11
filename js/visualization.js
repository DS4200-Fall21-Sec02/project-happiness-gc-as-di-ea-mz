// Immediately Invoked Function Expression to limit access to our 
// variables and prevent 

var margin = { top: 10, right: 30, bottom: 50, left: 60 },
  width = 1000 - margin.left - margin.right,
  height = 1000 - margin.top - margin.bottom;


const svg1 = d3
  .select("#vis-svg-1")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");



const path = d3.geoPath();
const projection = d3.geoMercator()
  .scale(70)
  .center([0,20])
  .translate([width / 2, height / 2]);

// Data and color scale
let data = new Map()
const colorScale = d3.scaleThreshold()
  .domain([2, 4, 6, 8])
  .range(d3.schemeReds[4]);


var g = svg1.append("g")
    .attr("class", "legendThreshold")
    .attr("transform", "translate(20,20)");
g.append("text")
    .attr("class", "caption")
    .attr("x", 0)
    .attr("y", -6)
    .text("Scores");

var labels = ['0', '2-4', '4-6', '6-8', '8-10'];
var legend = d3.legendColor()
    .labels(function (d) { return labels[d.i]; })
    .shapePadding(4)
    .scale(colorScale);
svg1.select(".legendThreshold")
    .call(legend);


Promise.all([
d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson"),

d3.csv("data/2020.csv", function(d) {
  console.log(d);


    data.set(d.Code, d.Score)
})
]).then(function(loadData){
    let topo = loadData[0]

    // Draw the map
  svg1.append("g")
    .selectAll("path")
    .data(topo.features)
    .join("path")
      // draw each country
      .attr("d", d3.geoPath()
        .projection(projection)
      )
      // set the color of each country
      .attr("fill", function (d) {
        d.total = data.get(d.id) || 0;
        return colorScale(d.total);
      })
});




