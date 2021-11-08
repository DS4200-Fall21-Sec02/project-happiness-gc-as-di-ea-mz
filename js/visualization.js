// Immediately Invoked Function Expression to limit access to our 
// variables and prevent 
d3.csv("data/2020.csv").then((data) => {

  console.log(data);
});