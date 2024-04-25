var projAO, projWO, projMI, dayAO, dayWO, dayMI
var iNatArray = [];

projAO = 180704153
projWO = 516277
projMI = 283154

dayAO = 180704253
dayWO = 516377
dayMI = 283254

async function iNatRetrieve() {
  const allURL = await fetch('https://api.inaturalist.org/v2/observations?verifiable=true&place=any&per_page=5', {cache: "no-store"});
  const allJson = await allURL.json(); //extract JSON from the http response
  const weevilURL = await fetch('https://api.inaturalist.org/v2/observations?taxon_id=60473&verifiable=true&per_page=5', {cache: "no-store"});
  const weevilJson = await weevilURL.json(); //extract JSON from the http response
  const idURL = await fetch('https://api.inaturalist.org/v1/identifications?own_observation=false&user_id=sdjbrown&current=true&order=desc&order_by=created_at', {cache: "no-store"});
  const idJson = await idURL.json(); //extract JSON from the http response
  const date = new Date(Date.now());
  const allRes = allJson.total_results;
  const projAllCounts = allRes - projAO;
  const dayAllCounts = allRes - dayAO;
  const weevilRes = weevilJson.total_results;
  const projWeevilCounts = weevilRes - projWO;
  const dayWeevilCounts = weevilRes - dayWO;
  const idRes = idJson.total_results;
  const projIDCounts = idRes - projMI;
  const dayIDCounts = idRes - dayMI;
  const out =  [{dateString: date, allCount: allRes, projAllCount: projAllCounts, dayAllCount: dayAllCounts, weevilCount: weevilRes, projWeevilCount: projWeevilCounts, dayWeevilCount: dayWeevilCounts, idCount: idRes, projIDCount: projIDCounts, dayIDCount: dayIDCounts}];
  return out[0]
}

//async function iNatPrint() {
//	var printRes = await iNatRetrieve();
//	console.log(printRes);
//	d3.select('#iNat').text(printRes.dateString+': '+printRes.count)
//	//d3.select('#iNat').text(dd+': '+cc)
//}

async function addData() {
	console.log(iNatArray);
	const ndata = await iNatRetrieve();
	return iNatArray.push(ndata);
}

//--------------------------------------------------------------------------------
//--------------------------------------------------------------------------------
//--------------------------------------------------------------------------------

// Create a blob of the data
var fileToSave = new Blob([JSON.stringify(iNatArray)], {
    type: 'application/json'
});

var fileName = 'iNatArray.json'

// Save the file
function saveFile() {
saveAs(fileToSave, fileName);
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
  $('#AllObservations span#summary').text(iNatArray[iNatArray.length-1].dateString+': '+iNatArray[iNatArray.length-1].allCount);
  $('#WeevilObservations span#summary').text(iNatArray[iNatArray.length-1].dateString+': '+iNatArray[iNatArray.length-1].weevilCount);
  $('#MyIdentifications span#summary').text(iNatArray[iNatArray.length-1].dateString+': '+iNatArray[iNatArray.length-1].idCount);
  
  $('#AllObservations span#projCounts').text('Project total: '+iNatArray[iNatArray.length-1].projAllCount);
  $('#WeevilObservations span#projCounts').text('Project total: '+iNatArray[iNatArray.length-1].projWeevilCount);
  $('#MyIdentifications span#projCounts').text('Project total: '+iNatArray[iNatArray.length-1].projIDCount);
	
  $('#AllObservations span#dayCounts').text('Day total: '+iNatArray[iNatArray.length-1].dayAllCount);
  $('#WeevilObservations span#dayCounts').text('Day total: '+iNatArray[iNatArray.length-1].dayWeevilCount);
  $('#MyIdentifications span#dayCounts').text('Day total: '+iNatArray[iNatArray.length-1].dayIDCount);
  dynamicPlot(iNatArray, 'allCount', '#totalObs');
  dynamicPlot(iNatArray, 'weevilCount', '#weevilObs');
  dynamicPlot(iNatArray, 'idCount', '#myIds');
}, 5 * 1000);

//--------------------------------------------------------------------------------
//--------------------------------------------------------------------------------
//--------------------------------------------------------------------------------


var WIDTH = 400;
var HEIGHT = 200;

function dynamicPlot(iNatArrayObject, key, svgID) {
	
d3.select(svgID)
	.style('width', WIDTH + 'px')
	.style('height', HEIGHT + 'px');

d3.select(svgID).selectAll("g > *").remove()
	
var yScale = d3.scaleLinear();
yScale.range([HEIGHT, 0]);
var yMin = d3.min(iNatArrayObject, function(datum, index){
	return datum[key] - 10;
})
var yMax = d3.max(iNatArrayObject, function(datum, index){
	return datum[key] + 20;
})

//yScale.domain(yDomain);
yScale.domain([yMin, yMax]);

//console.log(yMax)
//console.log(yScale.range())

d3.select(svgID).selectAll('circle')
	.data(iNatArrayObject)
	.enter()
	.append('circle')

d3.select(svgID).selectAll('circle')
	.attr('cy', function(datum, index){
		return yScale(datum[key]);
	});
	
var xScale = d3.scaleTime();	
xScale.range([0, WIDTH]);
var xDomain = d3.extent(iNatArrayObject, function(datum, index){
	return datum.dateString;
})
xScale.domain(xDomain);

//console.log(xScale.domain())
//console.log(xScale.range())
	
	
d3.select(svgID).selectAll('circle').data(iNatArrayObject)
	.attr('cx', function(datum, index){
		return xScale(datum.dateString);
	});

var bottomAxis = d3.axisBottom(xScale);
d3.select(svgID)
	.append('g')
	.call(bottomAxis)
	.attr('transform', 'translate(0,'+HEIGHT+')');
	
var leftAxis = d3.axisLeft(yScale);
d3.select(svgID)
	.append('g')
	.call(leftAxis);

}