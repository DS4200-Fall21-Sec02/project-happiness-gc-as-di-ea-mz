// variables
const margin = { top: 10, right: 30, bottom: 50, left: 60 },
    width = 1000 - margin.left - margin.right,
    height = 1000 - margin.top - margin.bottom;


//zoom functionality
const zoom = d3.zoom()
  .scaleExtent([1,5])
  .translateExtent([[0,5],[width,height]])
  .on("zoom", function () {
    svg1.attr("transform", d3.event.transform);
  })


// create frist vis
const svg1 = d3
.select("#vis-svg-1")
.append("svg")
.attr("width", width + margin.left + margin.right)
.attr("height", height + margin.top + margin.bottom)
.append("g")
.attr("transform", "translate(" + margin.left + "," + margin.top + ")")
.call(zoom);




// map variables
const path = d3.geoPath();;
const projection = d3.geoMercator()
.scale(130)
.center([0,20])
.translate([width / 2, height / 2]);



// Data and color scale

let data = new Map()
const colorScale = d3.scaleThreshold()
.domain([2, 4, 6, 8])
.range(d3.schemeReds[4]);

// adds legend to first vis
const g = svg1.append("g")
.attr("class", "legendThreshold")
.attr("transform", "translate(20,20)");
g.append("text")
.attr("class", "caption")
.attr("x", 0)
.attr("y", -6)
.text("Happiness Scores")
.attr("font-weight", "bold");


// Labels for the legend

const labels = ['0', '2-4', '4-6', '6-8', '8-10'];
const legend = d3.legendColor()
.labels(function (d) { return labels[d.i]; })
.shapePadding(4)
.scale(colorScale);
svg1.select(".legendThreshold")
.call(legend);



let year = 2020;

// Creates a slider which allows user to choose a year

const slider = d3.select("#year-slider")
  .on("input", function() {
    updateMap(Number(this.value));
    updateStats(Number(this.value));
  });


  d3.csv("data/2020.csv").then(function(data) {

  // Calculates statistics for the happiness score

  const maxScore = (Number(d3.max(data, function(d) {return d['Score']}))).toFixed(3);
  const minScore = (Number(d3.min(data, function(d) {return d['Score']}))).toFixed(3);
  const meanScore = d3.mean(data, function(d) {return d['Score']}).toFixed(3);

  // determines which countries have the min and max scores
  const minCountry = data.reduce((min, datum) => datum.Country > datum.Country ? min : datum["Country"]);
  const maxCountry = data.reduceRight((max, datum) => datum.Country < datum.Country ? max : datum["Country"]);


  const hapColors = ['#f0675c', '#375d81','#d4273e'];



  d3.select('.stats')
  .selectAll('.count')
  .data(hapColors)
  .style('background', function(d) {return d})

  // Displays min, max, and mean happiness score

  d3.select('.max')
  .text(maxScore + " " + maxCountry)
  .style("font-size", "26px")
  .style("font-weight", "bold");

  d3.select('.mean').text(meanScore).style("font-weight", "bold");
  d3.select('.min').text(minScore + " " + minCountry)
  .style("font-size", "26px")
  .style("font-weight", "bold");


});

// Changes the statistics depending on the year chosen on the slider 


function updateStats(year) {
  
  year = `${year}`;

  let csvYear = `data/${year}.csv`

  // Loads the file depending on the given year

  d3.csv(csvYear).then(function(data) {

  // Calculates statistics for the happiness score for the year


  const maxScore = (Number(d3.max(data, function(d) {return d['Score']}))).toFixed(3);

  const minScore = (Number(d3.min(data, function(d) {return d['Score']}))).toFixed(3)
  const meanScore = (Number(d3.mean(data, function(d) {return d['Score']}))).toFixed(3);

  // determines which countries have the min and max scores
  let minCountry = data.reduce((min, datum) => datum.Country > datum.Country ? min : datum["Country"]);
  let maxCountry = data.reduceRight((max, datum) => datum.Country < datum.Country ? max : datum["Country"]);
  const hapColors = ['#f0675c', '#375d81','#d4273e'];


  d3.select('.stats')
  .selectAll('.count')
  .data(hapColors)
  .style('background', function(d) {return d});

  // Displays min, max, and mean happiness score for the year

  d3.select('.max')
  .text(maxScore + " " + maxCountry)
  .style("font-weight", "bold");


  d3.select('.mean').text(meanScore).style("font-weight", "bold");
  d3.select('.min')
  .text(minScore + " " + minCountry)
  .style("font-weight", "bold");
});

}


// Tooltip for map
const tooltip = d3.select('body').append("div")
    .attr("class", "tooltip")
    .style("opacity", 0)
    .attr("width", 0);


// 2020 csv: create dictionaries that store countries' names and their corresponding attributes 
const dict = {};
const dict1 = {};
const dict2= {};
const dict3 = {};
const dict4 = {};
const dict5 = {};
d3.csv("data/2020.csv").then(function(data1) {
  data1.forEach(function(d,i){
    dict[d.Country] = [d.Generosity]
    dict1[d.Country] = [d['Social support']]
    dict2[d.Country] = [d['GDP per capita']]
    dict3[d.Country] = [d['Healthy life expectancy']]
    dict4[d.Country] = [d['Freedom to make life choices']]
    dict5[d.Country] = [d['Perceptions of corruption']]
    console.log(dict['USA']);
  
});
});

Promise.all([


  d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson"),

  d3.csv("data/2020.csv", function(d) {

  // initializes the map to store the country code as a key and the score as a value

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
  // add hover event to each country: show the tooltip that indicates country name and attributes
  .on("mouseover", function(d){
    d3.select(this)
      .attr("stroke", "grey").attr("stroke-width", 2)
    tooltip.style("opacity", 1)
           .html(d.properties['name'] + " <b>Score</b>: " + (Number(d.total)).toFixed(3) + " <b>Generosity</b>: " + dict[d.properties['name']] + " <b>Social support</b>: " + dict1[d.properties['name']]+ " <b>GDP</b>: " + dict2[d.properties['name']]+ " <b>Healthy life expectancy</b>: " + dict3[d.properties['name']] + " <b>Freedom to make life choices</b>: " + dict4[d.properties['name']]+ " <b>Perceptions of corruption</b>: " + dict5[d.properties['name']] )
           .style("top", (d3.event.pageY -75) + "px")
           .style("left", (d3.event.pageX -25) + "px");
  
    
  })

  //set tooltip invisible when the mouse leaves
  .on("mouseout", function(d){
    d3.select(this)
      .attr("stroke", null)
    tooltip.style("opacity", 0);
  });


});


// Updates the map based on year

function updateMap(year) {
  const yearSpan = document.getElementById("selected-year");
  yearSpan.innerText = `Year ${year}`;

  year = `${year}`;

  // Changes the csv depending on the year chosen on the slider 

  let csvYear = `data/${year}.csv`


//create dictionaries that store countries' names and their corresponding attributes
const dict = {};
const dict1 = {};
const dict2= {};
const dict3 = {};
const dict4 = {};
const dict5 = {};
d3.csv(csvYear).then(function(data1) {
  data1.forEach(function(d,i){
    dict[d.Country] = [d.Generosity]
    dict1[d.Country] = [d['Social support']]
    dict2[d.Country] = [d['GDP per capita']]
    dict3[d.Country] = [d['Healthy life expectancy']]
    dict4[d.Country] = [d['Freedom to make life choices']]
    dict5[d.Country] = [d['Perceptions of corruption']]

});
});

  Promise.all([


  d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson"),

  d3.csv(csvYear, function(d) {

     console.log(d);
  
  // initializes the map to store the country code as a key and the score as a value

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
  // add hover event to each country:show the tooltip that indicates country name and attributes
  .on("mouseover", function(d){
    d3.select(this)
      .attr("stroke", "grey").attr("stroke-width", 2)
    tooltip.style("opacity", 1)
           .html(d.properties['name'] + " <b>Score</b>: " + (Number(d.total)).toFixed(3) + " <b>Generosity</b>: " + dict[d.properties['name']] + " <b>Social support</b>: " + dict1[d.properties['name']]+ " <b>GDP</b>: " + dict2[d.properties['name']]+ " <b>Healthy life expectancy</b>: " + dict3[d.properties['name']] + " <b>Freedom to make life choices</b>: " + dict4[d.properties['name']]+ " <b>Perceptions of corruption</b>: " + dict5[d.properties['name']] )
           .style("top", (d3.event.pageY - 75) + "px")
           .style("left", (d3.event.pageX - 25) + "px")
  
    
  })
  //set tooltip invisible when the mouse leaves
  .on("mouseout", function(d){
    d3.select(this)
      .attr("stroke", null)
    tooltip.style("opacity", 0);
  });



});

}

//set some basic variables 
const margin2 = { top: 10, right: 30, bottom: 50, left: 60 };

const size = 140,
    padding = 20;

//x and y scales
const x = d3.scaleLinear()
.range([padding / 2, size - padding / 2]);

const y = d3.scaleLinear()
.range([size - padding / 2, padding / 2]);

//initializes brush cell
let brushCell;
const brushFx = d3.brush()
.extent([[0, 0], [size, size]])


// x and y axis
const xAxis = d3.axisBottom()
.scale(x)
.ticks(6);

const yAxis = d3.axisLeft()
.scale(y)
.ticks(6);


//create brushing
d3.csv("data/2020v2.csv").then(function(data) {

  
  brushFx
  .on('start', brushstart)
  .on('brush', brushmove)
  .on('end', brushend)

  const domainByTrait = {}

  // Gets features apart from the region
  const traits = d3.keys(data[0]).filter(d => d !== 'Region')
  const regions = ['Western Europe','North America and ANZ', 'Middle East and North Africa',
    'Latin America and Caribbean', 'Central and Eastern Europe', 'East Asia', 'Southeast Asia',
    'Commonwealth Nations', 'Sub-Saharan Africa', 'South Asia' ]
  const n = traits.length


  //color scale
  const color = d3.scaleOrdinal()
  .domain(regions)
  .range(d3.schemeCategory10);


 //store the domain of each trait 
  traits.forEach(trait => {
    domainByTrait[trait] = d3.extent(data, d => d[trait]);
  });

  xAxis.tickSize(size * n);
  yAxis.tickSize(-size * n);

//create the background and x, y axis 
  const svg2 = d3
  .select("#vis-svg-2")
  .append("svg")
  .attr("width", size * n + padding + 150 )
  .attr("height", size * n + padding + 10)
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

//draw each cell
  const cell = svg2.selectAll(".cell")
  .data(cross(traits, traits))
  .enter().append("g")
  .attr("class", "cell")
  .attr("transform", function(d) { return "translate(" + (n - d.i - 1) * size + "," + d.j * size + ")"; })
  .each(plot);

  // Titles for the diagonal.
  cell.filter(function(d) { return d.i === d.j; }).append("text")
  .attr("x", padding - 8)
  .attr("y", padding)
  .attr("dy", ".71em")
  .text(function(d) { return d.x; });



  cell.call(brushFx);

//creating legends
//draw the dots
  svg2.selectAll("mydots")
  .data(regions)
  .enter()
  .append("rect")
  .attr("x", 700)
  .attr("transform", "translate(130,-10)")
  .attr("y", function(d,i){ return 50 + i*(15 + 5)}) // 100 is where the first dot appears. 25 is the distance between dots
  .attr("width", 15)
  .attr("height", 15)
  .style("fill", function(d){ return color(d)})

// Add one dot in the legend for each name.
  svg2.selectAll("mylabels")
  .data(regions)
  .enter()
  .append("text")
  .attr("x", 700 + 15*1.2)
  .attr("transform", "translate(130,-10)")
  .attr("y", function(d,i){ return 50 + i*(15+5) + (15/2)}) // 100 is where the first dot appears. 25 is the distance between dots
  .style("fill", function(d){ return color(d)})
  .text(function(d){ return d})
  .attr("text-anchor", "left")
  .style("alignment-baseline", "middle")

//define the plot function that draws each cell
  function plot(p) {
    const cell = d3.select(this);

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
    .attr("r", 2)
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
    const e = d3.brushSelection(this);
    svg2.selectAll("circle").classed("hidden", function(d) {
      return e && (
          e[0][0] > x(+d[p.x]) || x(+d[p.x]) > e[1][0]
          || e[0][1] > y(+d[p.y]) || y(+d[p.y]) > e[1][1]
      )
    });
  }

  // If the brush is empty, select all circles.
  function brushend() {
    const e = d3.brushSelection(this);
    if (!e) svg2.selectAll('.hidden').classed('hidden', false);
  }
});

function cross(a, b) {
  const c = [], n = a.length, m = b.length;
  let i, j;
  for (i = -1; ++i < n;) for (j = -1; ++j < m;) c.push({x: a[i], i: i, y: b[j], j: j});
  return c;
}
