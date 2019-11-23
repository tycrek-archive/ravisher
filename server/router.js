const { sass, http, log, path, atob } = require('./utils');
const fs = require('fs-extra');
const Sass = require('node-sass');
const minify = require('@node-minify/core');
const uglify = require('@node-minify/uglify-es');
const rarbg = require('rarbg-api');
const qbapi = require('qbittorrent-api');
const router = require('express').Router();
module.exports = router;

const movie_params = {
	// X264_FHD, X264_HD, BD_RE, X264_3D, XVID_HD, X264_4k, X265_4k, X265_4kHDR
	category: [44, 45, 46, 47, 48, 50, 51, 52],
	// XVID, X264, FULLBD
	category2: [14, 17, 42],
	limit: 100,
	sort: 'seeders',
	min_seeders: 2,
	min_leechers: null,
	format: 'json_extended',
	ranked: null,
	savePath: '/mnt/media/Movies/'
};

const tv_params = {
	category: [18, 41, 49],
	limit: 100,
	sort: 'seeders',
	min_seeders: 2,
	min_leechers: null,
	format: 'json_extended',
	ranked: null,
	savePath: '/mnt/media/TV_Shows/'
};

// Compile and compress Sass
router.get('/css', (_req, res, next) => {
	Sass.render(sass, (err, result) => {
		err ? next(err) : res.type('css').send(result.css);
	});
});

// Compress all JavaScript files using Uglify-ES
router.get('*.js', (req, res, next) => {
	fs.readFile(path(`../client/javascript${req.url}`))
		.then(bytes => bytes.toString())
		.then(javascript => minify({ compressor: uglify, content: javascript }))
		.then(minified => res.type('js').send(minified))
		.catch(err => next(err));
});

router.get('/', (_req, res, _next) => res.render('index'));

router.get('/api/:tool/:mode/:query', (req, res, next) => {
	let tool = req.params.tool;
	let movies = req.params.mode === 'movies';
	let query = atob(req.params.query);
	let desperate = req.query.desperate === 'true';

	tool === 'search' ? search(movies, query, desperate) : tool === 'download' ? download(movies, query) : next();

	function search(movies, query, desperate) {
		let temp_p = movies ? movie_params : tv_params;
		let params = {};

		for (prop in temp_p) params[prop] = temp_p[prop];

		if (desperate && movies) params.category = movie_params.category.concat(movie_params.category2);
		if (desperate) params.min_seeders = null;

		rarbg.search(query, params).then(data => res.send(data)).catch(err => res.send(err));
	}

	function download(movies, query) {
		let savePath = movies ? movie_params.savePath : tv_params.savePath;
		let auth = require('fs-extra').readJsonSync(path('auth.json'));
		let qbt = qbapi.connect(auth.hostname, auth.username, auth.password);
		log.info(`Torrent added: ${query}`);
		qbt.add(query, savePath, err => {
			if (err) log.warn(err);
			res.send({ msg: err ? 'Error!' : 'Added!' });
		});
	}
});

// HTTP 404
router.use((_req, res) => res.status(404).send(http._404));

// HTTP 500
router.use((err, _req, res, _next) => {
	log.error(err.stack);
	res.status(500).send(http._500);
});