
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

var margin2 = { top: 10, right: 30, bottom: 50, left: 60 };

var size = 130,
    //size = 230,
    padding = 20;

var x = d3.scaleLinear()
    .range([padding / 2, size - padding / 2]);

var y = d3.scaleLinear()
    .range([size - padding / 2, padding / 2]);

let brushCell;
var brushFx = d3.brush()
    .extent([[0, 0], [size, size]])
 

var xAxis = d3.axisBottom()
    .scale(x)
    .ticks(6);

var yAxis = d3.axisLeft()
    .scale(y)
    .ticks(6);

var color = d3.scaleOrdinal().range(d3.schemeCategory10);

//export default async function App() {
  //const data = await csv('data/2020 - Copy.csv')
  //scatterplotMatrix(data)
//}



//function scatterplotMatrix(data) {


d3.csv("data/2020v2.csv").then(function(data) {
  brushFx
    .on('start', brushstart)
    .on('brush', brushmove)
    .on('end', brushend)    

  const domainByTrait = {}
  const traits = d3.keys(data[0]).filter(d => d !== 'Region')
  const n = traits.length

  traits.forEach(trait => {
    domainByTrait[trait] = d3.extent(data, d => d[trait]);
  });
  
  xAxis.tickSize(size * n);
  yAxis.tickSize(-size * n);


  var svg2 = d3
      .select("#vis-svg-2")
      .append("svg")
      .attr("width", size * n + padding)
      .attr("height", size * n + padding)
    .append("g")
      .attr("transform", "translate(" + padding + "," + padding / 2 + ")");


  svg2.selectAll(".x.axis")
      .data(traits)
    .enter().append("g")
      .attr("class", "x axis")
      .attr("transform", function(d, i) { return "translate(" + (n - i - 1) * size + ",0)"; })
      .each(function(d) { x.domain(domainByTrait[d]); d3.select(this).call(xAxis); });

  svg2.selectAll(".y.axis")
      .data(traits)
    .enter().append("g")
      .attr("class", "y axis")
      .attr("transform", function(d, i) { return "translate(0," + i * size + ")"; })
      .each(function(d) { y.domain(domainByTrait[d]); d3.select(this).call(yAxis); });

  var cell = svg2.selectAll(".cell")
      .data(cross(traits, traits))
    .enter().append("g")
      .attr("class", "cell")
      .attr("transform", function(d) { return "translate(" + (n - d.i - 1) * size + "," + d.j * size + ")"; })
      .each(plot);

  // Titles for the diagonal.
  cell.filter(function(d) { return d.i === d.j; }).append("text")
      .attr("x", padding)
      .attr("y", padding)
      .attr("dy", ".71em")
      .text(function(d) { return d.x; });

  cell.call(brushFx);

  function plot(p) {
    var cell = d3.select(this);

    x.domain(domainByTrait[p.x]);
    y.domain(domainByTrait[p.y]);

    cell.append("rect")
        .attr("class", "frame")
        .attr("x", padding / 2)
        .attr("y", padding / 2)
        .attr("width", size - padding)
        .attr("height", size - padding);

    cell.selectAll("circle")
        .data(data)
      .enter().append("circle")
        .attr("cx", function(d) { return x(d[p.x]); })
        .attr("cy", function(d) { return y(d[p.y]); })
        .attr("r", 4)
        .style("fill", function(d) { return color(d.Region); });
  }

  

  // Clear the previously-active brush, if any.
  function brushstart(p) {
    if (brushCell !== this) {
      d3.select(brushCell).call(brushFx.move, null);
      brushCell = this;
    x.domain(domainByTrait[p.x]);
    y.domain(domainByTrait[p.y]);
    }
  }

  // Highlight the selected circles.
  function brushmove(p) {
    var e = d3.brushSelection(this);
    svg2.selectAll("circle").classed("hidden", function(d) {
      return e && (
        e[0][0] > x(+d[p.x]) || x(+d[p.x]) > e[1][0]
        || e[0][1] > y(+d[p.y]) || y(+d[p.y]) > e[1][1]
      )
    });
  }

  // If the brush is empty, select all circles.
  function brushend() {
    var e = d3.brushSelection(this);
    if (!e) svg2.selectAll('.hidden').classed('hidden', false);
  }
});

function cross(a, b) {
  var c = [], n = a.length, m = b.length;
  let i, j;
  for (i = -1; ++i < n;) for (j = -1; ++j < m;) c.push({x: a[i], i: i, y: b[j], j: j});
  return c;
}