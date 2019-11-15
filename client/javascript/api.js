function switchSearchMode() { $('.search-switch').toggle(); }

function search(mode) {
	if (mode == 0) {
		let title = $('#moviesTitle').val();
		let year = $('#moviesYear').val();

		let search = btoa(title + ' ' + year);

		fetch(`/api/search/movies/${search}`)
			.then((res) => res.json())
			.then((json) => parseResults(json));
	}
}

function parseResults(json) {
	if (json.error_code && json.error_code == 20) return alert('No results found!');

	console.log(json);
}