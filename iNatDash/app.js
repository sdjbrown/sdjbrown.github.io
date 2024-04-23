async function iNatRetrieve() {
  const response = await fetch('https://api.inaturalist.org/v1/observations?taxon_id=60473');
  const myJson = await response.json(); //extract JSON from the http response
  const date = new Date(Date.now());
  const res = myJson.total_results;
  const out =  [{dateString: date, count: res}];
  return out[0]
}

async function iNatPrint() {
	var printRes = await iNatRetrieve();
	console.log(printRes);
	d3.select('#iNat').text(printRes.dateString+': '+printRes.count)
	//d3.select('#iNat').text(dd+': '+cc)
}


var WIDTH = 800;
var HEIGHT = 500;

var runs = [
{
	id: 1,
	date: 'October 1, 2017 at 4:00PM',
	distance: 5.2
},
{
	id: 2,
	date: 'October 2, 2017 at 5:00PM',
	distance: 7.072
},
{
	id: 3,
	date: 'October 3, 2017 at 6:00PM',
	distance: 8.7
},
{
	id: 4,
	date: 'October 4, 2017 at 6:00PM',
	distance: 6.5
}
];

d3.select('svg')
	.style('width', WIDTH + 'px')
	.style('height', HEIGHT + 'px');

var yScale = d3.scaleLinear();
yScale.range([HEIGHT, 10]);
var yDomain = d3.extent(runs, function(datum, index){
	return datum.distance;
})
yScale.domain(yDomain);

console.log(yScale.domain())
console.log(yScale.range())

d3.select('svg').selectAll('circle')
	.data(runs)
	.enter()
	.append('circle')

d3.selectAll('circle')
	.attr('cy', function(datum, index){
		return yScale(datum.distance);
	});
	
var parseTime = d3.timeParse("%B%e, %Y at %-I:%M%p");
var formatTime = d3.timeFormat("%d %b %Y %-I:%M%p");
var xScale = d3.scaleTime();	
xScale.range([0, WIDTH]);
var xDomain = d3.extent(runs, function(datum, index){
	return parseTime(datum.date);
})
xScale.domain(xDomain);

//console.log(xScale.domain())
//console.log(xScale.range())
	
	
d3.selectAll('circle').data(runs)
	.attr('cx', function(datum, index){
		return xScale(parseTime(datum.date));
	});

var bottomAxis = d3.axisBottom(xScale);
d3.select('svg')
	.append('g')
	.call(bottomAxis)
	.attr('transform', 'translate(0,'+HEIGHT+')');
	
var leftAxis = d3.axisLeft(yScale);
d3.select('svg')
	.append('g')
	.call(leftAxis);
	
var createTable = function() {
	for(var i = 0; i < runs.length; i++) {
		var row = d3.select('tbody').append('tr');
		row.append('td').html(runs[i].id);
		row.append('td').html(runs[i].date);
		row.append('td').html(runs[i].distance);
	}
}
createTable();