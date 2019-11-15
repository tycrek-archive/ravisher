var isModeMovies = true;

function switchSearchMode() {
	$('.search-switch').toggle();
	isModeMovies = !isModeMovies;
}

function search(mode) {
	$('.result-row').remove();
	if (mode == 0) {
		let title = $('#moviesTitle').val();
		let year = $('#moviesYear').val();

		let search = btoa(title + ' ' + year);
		fetch(`/api/search/movies/${search}`)
			.then(res => res.json())
			.then(json => parseResults(json));
	} else {
		let title = $('#tvTitle').val();
		let season = $('#tvSeason').val();
		let episode = $('#tvEpisode').val();

		if (season.length > 0) season = 'S' + season;
		if (episode.length > 0) episode = 'E' + episode;
		if (season.length == 2) season = season.replace('S', 'S0');
		if (episode.length == 2) episode = episode.replace('E', 'E0');

		let search = btoa(`${title} ${season + episode}`);
		fetch(`/api/search/tv/${search}`)
			.then(res => res.json())
			.then(json => parseResults(json));
	}
}

function parseResults(json) {
	if (json.error_code && json.error_code == 20) return alert('No results found!');

	const V_FORMATS = ['2160p', '1080p', '720p'];
	const A_FORMATS = ['Atmos', '7.1.', '5.1.', 'AAC'];

	count = 0;
	json.forEach(result => {
		let t = result.title;
		let score = 0;
		let flags = '';

		let bluray = t.includes('BluRay') ? true : false;
		let remux = t.includes('REMUX') ? true : false;
		let hevc = t.includes('HEVC') ? true : false;
		let tenbit = t.includes('10bit') ? true : false;
		let atmos = t.includes('Atmos') ? true : false;
		let d3 = t.includes('3D') ? true : false;
		score += bluray ? 1 : 0;
		score += remux ? 1 : 0;
		score += hevc ? 1 : 0;
		score += tenbit ? 1 : 0;
		score += atmos ? 1 : 0;
		flags += bluray ? 'BD, ' : '';
		flags += remux ? 'R, ' : '';
		flags += hevc ? 'H, ' : '';
		flags += tenbit ? '10, ' : '';
		flags += atmos ? 'A, ' : '';
		flags += d3 ? '3D, ' : '';


		// Audio //
		let audio;
		A_FORMATS.forEach(format => {
			if (!audio && t.includes(format)) audio = format;
		});
		if (!audio) audio = 'Stereo';
		else score += A_FORMATS.length - A_FORMATS.indexOf(audio);


		// Video //
		let video;
		V_FORMATS.forEach(format => {
			if (!video && t.includes(format)) video = format;
		});
		if (!video) video = '?';
		else score += V_FORMATS.length - V_FORMATS.indexOf(video);


		let downloadButton = `<button onclick="download('${btoa(result.download)}');">Add</button>`;
		let row = `
		<tr id="${count}-media" class="result-row">
		<td style="text-align: left;">${t.split(`.${video}`)[0].replace(/\./g, ' ')}</td>
		<td>${video.includes('.') ? video.substring(0, video.length - 1) : video}</td>
		<td>${audio.includes('.') ? audio.substring(0, audio.length - 1) : audio}</td>
		<td>${nFormatter(result.size)}</td>
		<td>${result.seeders}</td>
		<td id="${count}-score">${score}</td>
		<td>${flags.substring(0, flags.length - 2)}</td>
		<td>${downloadButton}</td>
		</tr>`;
		$('#results-table tr:last').after(row);

		$('#results').show();
		count++;
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
	let mode = isModeMovies ? 'movies' : 'tv';
	fetch(`/api/download/${mode}/${magnet}`)
		.then(res => res.json())
		.then(json => alert(json.msg));
}

const bytes = {
	giga: 1073741824,
	mega: 1048576,
	kilo: 1024
};
function nFormatter(num) {
	if (num >= bytes.giga) {
		return (num / bytes.giga).toFixed(2).replace(/\.0$/, '') + ' GB';
	}
	if (num >= bytes.mega) {
		return (num / bytes.mega).toFixed(2).replace(/\.0$/, '') + ' MB';
	}
	if (num >= bytes.kilo) {
		return (num / bytes.kilo).toFixed(2).replace(/\.0$/, '') + ' KB';
	}
	return num;
}