var isModeMovies = true;

function switchSearchMode() {
	$('.search-switch').toggle();
	isModeMovies = !isModeMovies;
}

function search(mode) {
	$('.result-row').remove();
	let search, type;
	if (mode == 0) {
		type = 'movies';
		search = btoa(`${$('#moviesTitle').val()} ${$('#moviesYear').val()}`);
	} else {
		type = 'tv';
		let title = $('#tvTitle').val(), season = $('#tvSeason').val(), episode = $('#tvEpisode').val();
		if (season.length > 0) season = 'S' + season;
		if (episode.length > 0) episode = 'E' + episode;
		if (season.length == 2) season = season.replace('S', 'S0');
		if (episode.length == 2) episode = episode.replace('E', 'E0');
		search = btoa(`${title} ${season + episode}`);
	}

	let query = `/api/search/${type}/${search}?desperate=${$(`#${type}Desperate`).is(':checked')}`;
	fetch(query)
		.then(res => res.json())
		.then(json => parseResults(json));
}

function parseResults(json) {
	if (json.error_code && json.error_code == 20) return alert('No results found!');

	const FORMATS = [['2160p', '1080p', '720p'], ['Atmos', '7.1', '5.1', 'AAC']];
	const FLAGS = ['BluRay', 'REMUX', 'HEVC', '10bit', 'HDR', 'Atmos', '3D'];

	json.forEach(result => {
		console.log(result.title); // Mainly for debugging but it's nice to have

		let t = result.title, score = 0, flags = '', formats = [];
		FLAGS.forEach(flag => { if (t.includes(flag)) (score += 1, flags += `${flag}, `); });
		for (let i in FORMATS) {
			FORMATS[i].forEach(format => { if (!formats[i] && t.includes(format)) formats[i] = format; });
			if (!formats[i]) formats[i] = i == 0 ? '?' : 'Stereo';
			else score += FORMATS[i].length - FORMATS[i].indexOf(formats[i]);
		}

		score = Math.round(score);
		$('#results-table tr:last').after(`
			<tr id="${json.indexOf(result)}-media" class="result-row">
			<td style="text-align: left;">${t.split(`.${formats[0]}`)[0].replace(/\./g, ' ')}</td>
			<td>${formats[0]}</td>
			<td>${formats[1]}</td>
			<td>${nFormatter(result.size)}</td>
			<td>${result.seeders}</td>
			<td id="${json.indexOf(result)}-score">${score}</td>
			<td style="text-align: left;">${flags.substring(0, flags.length - 2)}</td>
			<td><button onclick="download('${btoa(result.download)}');">Add</button></td>
			</tr>`);

		$('#results').show();
	});
	sortTable();
}

function sortTable() {
	let scores = {};
	$('.result-row').each(index => scores[index] = $(`#${index}-score`).text());

	let sorted = Object.keys(scores).sort((a, b) => scores[a] - scores[b]);
	sorted.forEach(count => {
		let row = $(`#${count}-media`);
		row.remove();
		$('#results-table tr:first').after(row);
	});
}

function download(magnet) {
	fetch(`/api/download/${isModeMovies ? 'movies' : 'tv'}/${magnet}`)
		.then(res => res.json())
		.then(json => alert(json.msg));
}

const bytes = { giga: 1073741824, mega: 1048576, kilo: 1024 };
function nFormatter(num) {
	if (num >= bytes.giga) return (num / bytes.giga).toFixed(2).replace(/\.0$/, '') + ' GB';
	if (num >= bytes.mega) return (num / bytes.mega).toFixed(2).replace(/\.0$/, '') + ' MB';
	if (num >= bytes.kilo) return (num / bytes.kilo).toFixed(2).replace(/\.0$/, '') + ' KB';
	return num;
}