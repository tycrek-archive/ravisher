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
	category: [44, 45, 50, 51, 51, 42, 46],
	limit: 100,
	sort: 'seeders',
	min_seeders: 2,
	min_leechers: null,
	format: 'json_extended',
	ranked: null,
};

const tv_params = {
	category: [18, 41, 49],
	limit: 100,
	sort: 'seeders',
	min_seeders: 2,
	min_leechers: null,
	format: 'json_extended',
	ranked: null,
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
	let mode = req.params.mode;
	let query = atob(req.params.query);

	if (tool === 'search') {
		let params = mode === 'movies' ? movie_params : tv_params;
		rarbg.search(query, params).then(data => res.send(data))
	} else if (tool === 'download') {
		res.send('Sure thing');
	} else {
		next();
	}
});

// HTTP 404
router.use((_req, res) => res.status(404).send(http._404));

// HTTP 500
router.use((err, _req, res, _next) => {
	log.error(err.stack);
	res.status(500).send(http._500);
});