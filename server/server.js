'use strict';

/* NPM Packages*/
var Compression = require('compression');
var BodyParser = require('body-parser');
var Express = require('express');
var Helmet = require('helmet');
var Http = require('http');

/* Imports */
var Logger = require('./helpers/logger');
var Sockets = require('./sockets');

/* Global Variables */
var Router = Express.Router();
var App = new Express();

/* Setting Validation */

/* Functions */

exports.start = function (homeDirectory) {

	// Database
	require('./database').connect();
	// Sockets
	var Server = Http.createServer(App);

	var io = require('socket.io').listen(Server);
	Sockets.connect(io);
	// Routes
	require('./routes/')(Router, io);

	var port = 8080;
	if (process.env.NODE_ENV === 'production') {
		port = process.env.port;
	}

	try {
		// Security
		App.use(new Helmet());
		App.use(Helmet.hidePoweredBy());

		// Compression
		App.use(Compression());

		// Static Files
		App.use('/scripts/', Express.static(homeDirectory + '/bower_components'));
		App.use('/app', Express.static(homeDirectory + '/app'));
		App.use('/', Express.static(homeDirectory + '/bower_components'));
		App.use('/images/', Express.static(homeDirectory + '/images'));
		App.use('/', Express.static(homeDirectory + '/app/public'));
		App.use('/', Express.static(homeDirectory + '/public'));
		
		App.use('/', Router);
		App.set('view engine', 'ejs');
		App.use(BodyParser.urlencoded({
			extended: true
		}));

		Server.listen(port, function () {
			Logger.info('Starting server @ http://localhost:' + port);
		});

		return App;

	} catch (error) {
		Logger.fatal('Server failed to start: ' + error);
	}
};
