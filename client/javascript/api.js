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
	alert(JSON.stringify(json));
}