var latitude, longitude, radius, placeID, focalTaxonID, user, dateFrom
var list

async function apiCall() {
	const allSpeciesApi = 'https://api.inaturalist.org/v2/observations/species_counts?taxon_id=' + focalTaxonID + '&lat=' + latitude + '&lng=' + longitude + '&radius=' + radius + '&order=desc';
	const allSpeciesURL = await fetch(allSpeciesApi, {cache: "no-store"});
	const allSpeciesJson = await allSpeciesURL.json(); //extract JSON from the http response
	
	const userSpeciesURL = await fetch(allSpeciesApi + '&user_id=' + user, {cache: "no-store"});
	const userSpeciesJson = await userSpeciesURL.json(); //extract JSON from the http response

	var userSpeciesID = userSpeciesJson.results.map(item => item.taxon.id);
	
	const exclSpeciesApi = 'https://api.inaturalist.org/v2/observations?taxon_id=' + focalTaxonID + '&lat=' + latitude + '&lng=' + longitude + '&radius=' + radius + '&fields=id,location,place_guess,uri,species_guess,observed_on,taxon';
	const exclSpeciesURL = await fetch(exclSpeciesApi + '&without_taxon_id=' + userSpeciesID + '&d1=' + dateFrom, {cache: "no-store"});
	const exclSpeciesJson = await exclSpeciesURL.json(); //extract JSON from the http response	
	
	$('#apiCall').text(allSpeciesJson.total_results + ' ' + userSpeciesJson.total_results + ' ' + exclSpeciesJson.total_results);
	
	list = exclSpeciesJson.results;
}

function createTable() {

            // Get column names
            const columns = Object.keys(list[0]);

            // Create table
            const table =
                document.createElement("table");

            table.border = "1";

            // Create header row
            const headerRow =
                table.insertRow();

            columns.forEach(column => {
                const th =
                    document.createElement("th");

                th.textContent = column;

                headerRow.appendChild(th);
            });

            // Create data rows
            list.forEach(item => {
                const row = table.insertRow();

                columns.forEach(column => {
                    const cell = row.insertCell();

                    cell.textContent =
                        item[column] ?? "";
                });
            });

            // Display the table
            const container =
                document.getElementById(
                    "tableContainer"
                );

            container.innerHTML = "";
            container.appendChild(table);
        }



//https://stackoverflow.com/questions/31059824/set-input-value-to-javascript-variable
//https://jsfiddle.net/0p8rjq9h/
function displayMessage(fieldTag){
		var themsg = document.getElementById(fieldTag).value;
    if (themsg){
        $('#'+fieldTag+'SetValue').text('(Value set: '+themsg+')');
    }
    else{
        $('#'+fieldTag+'SetValue').text('No number set');
    }
    return themsg;
}




