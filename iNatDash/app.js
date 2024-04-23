async function iNatRetrieve() {
  const response = await fetch('https://api.inaturalist.org/v1/observations?taxon_id=60473');
  const myJson = await response.json(); //extract JSON from the http response
  const date = new Date(Date.now());
  const res = myJson.total_results;
  const out =  [{dateString: date, count: res}];
  return out[0]
}

//async function iNatPrint() {
//	var printRes = await iNatRetrieve();
//	console.log(printRes);
//	d3.select('#iNat').text(printRes.dateString+': '+printRes.count)
//	//d3.select('#iNat').text(dd+': '+cc)
//}

var iNatArray = [{dateString: new Date(Date.now()), count: 0}];

async function addData() {
	console.log(iNatArray);
	const ndata = await iNatRetrieve();
	return iNatArray.push(ndata);
}

//--------------------------------------------------------------------------------
//--------------------------------------------------------------------------------
//--------------------------------------------------------------------------------

//https://dev.to/jsmccrumb/asynchronous-setinterval-4j69

var counter = 0

const asyncIntervals = [];

const runAsyncInterval = async (cb, interval, intervalIndex) => {
  await cb();
  if (asyncIntervals[intervalIndex].run) {
    asyncIntervals[intervalIndex].id = setTimeout(() => runAsyncInterval(cb, interval, intervalIndex), interval)
  }
};

const setAsyncInterval = (cb, interval) => {
  if (cb && typeof cb === "function") {
    const intervalIndex = asyncIntervals.length;
    asyncIntervals.push({run: true, id: 0});
    runAsyncInterval(cb, interval, intervalIndex);
    return intervalIndex;
  } else {
    throw new Error('Callback must be a function');
  }
};

const clearAsyncInterval = (intervalIndex) => {
  if (asyncIntervals[intervalIndex].run) {
     clearTimeout(asyncIntervals[intervalIndex].id)
     asyncIntervals[intervalIndex].run = false
  }
};

setAsyncInterval(async () => {
  console.log('start'+counter++);
  await addData();
  $('#iNat').text(iNatArray[iNatArray.length-1].dateString+': '+iNatArray[iNatArray.length-1].count);
  dynamicPlot(iNatArray);
}, 5 * 1000);

//--------------------------------------------------------------------------------
//--------------------------------------------------------------------------------
//--------------------------------------------------------------------------------

var WIDTH = 800;
var HEIGHT = 500;

function dynamicPlot(iNatArrayObject) {

d3.select('svg')
	.style('width', WIDTH + 'px')
	.style('height', HEIGHT + 'px');

var yScale = d3.scaleLinear();
yScale.range([HEIGHT, 0]);
//var yDomain = d3.extent(runs, function(datum, index){
//	return datum.distance;
//})
//yScale.domain(yDomain);
yScale.domain([524960, 524980]);

//console.log(yScale.domain())
//console.log(yScale.range())

d3.select('svg').selectAll('circle')
	.data(iNatArrayObject)
	.enter()
	.append('circle')

d3.selectAll('circle')
	.attr('cy', function(datum, index){
		return yScale(datum.count);
	});
	
var parseTime = d3.timeParse("%B%e, %Y at %-I:%M%p");
var formatTime = d3.timeFormat("%d %b %Y %-I:%M%p");
var xScale = d3.scaleTime();	
xScale.range([0, WIDTH]);
var xDomain = d3.extent(iNatArrayObject, function(datum, index){
	return datum.dateString;
})
xScale.domain(xDomain);

//console.log(xScale.domain())
//console.log(xScale.range())
	
	
d3.selectAll('circle').data(iNatArrayObject)
	.attr('cx', function(datum, index){
		return xScale(datum.dateString);
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
	for(var i = 0; i < iNatArray.length; i++) {
		var row = d3.select('tbody').append('tr');
		row.append('td').html(iNatArrayObject[i].dateString);
		row.append('td').html(iNatArrayObject[i].count);
	}
}
createTable();

}