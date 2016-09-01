'use strict';

/* NPM Packages*/

/* Imports */
var Player = require('../query/player');
var GameHelper = require('../helpers/game');

/* Variables */

/* Routes */
module.exports = function (Router) {

	/* All players */
	Router.get('/api/players', function (request, response) {
		Player.getAll(request, response);
	});

	/* Player by name */
	Router.get('/api/player/:name', function (request, response) {
		var playerName = GameHelper.formatName(request.params.name);
		Player.get(playerName, request, response);
	});

	/* Player stats */
	Router.get('/api/player/:name/stats', function (request, response) {
		var playerName = GameHelper.formatName(request.params.name);
		Player.getStats(playerName, request, response);
	});

};
