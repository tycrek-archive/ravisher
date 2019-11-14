const path = require('path');
const fs = require('fs');
const pino = require('pino')({
	prettyPrint: process.env.NODE_ENV === 'production' ? false : true
});

module.exports = {
	log: pino,
	path: joinPath,
	CONFIG: {
		port: 8282,
		icon: joinPath('../client/static/favicon.ico'),
		static: joinPath('../client/static'),
		images: joinPath('../client/images'),
		views: joinPath('../client/views/pages'),
		users: { 'ravisher': 'ravisheradmin' }
	},
	http: {
		_404: '<title>404 - Page not found</title><center><br><br><h1>404 - Page not found</h1></center>',
		_500: '<title>500 - Internal server error</title><center><br><br><h1>500 - Internal server error</h1></center>'
	},
	btoa: (s) => Buffer.from(s).toString('base64'),
	atob: (s) => Buffer.from(s, 'base64').toString()
};

function joinPath(file) {
	return path.join(__dirname, file);
}