const { CONFIG, log } = require('./utils');
const express = require('express');
const app = express();

app.enable('strict routing');
app.use(require('compression')());
app.use(require('helmet')());
app.use(require('express-pino-logger')({ logger: log }));
//app.use(require('serve-favicon')(CONFIG.icon));

app.use(express.static(CONFIG.static));
app.use('/images', express.static(CONFIG.images));
app.use(require('./router'));

app.set('views', CONFIG.views);
app.set('view engine', 'pug');

app.listen(CONFIG.port, () => {
	log.info(`Server hosted (0.0.0.0:${CONFIG.port})`);
});