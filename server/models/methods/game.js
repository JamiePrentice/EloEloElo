'use strict';

/* NPM Packages*/

/* Imports */
var Player = require('../../models/player');
var PlayerMethods = require('../../models/methods/player');
var Game = require('../../models/game');
var Logger = require('../../helpers/logger');
var Sockets = require('../../helpers/sockets');
var GameHelper = require('../../helpers/game');
/* Global Variables */

/* Functions */

/* Add a game to the queue */
exports.queue = function (player1, player2, io) {
  if (player1.length >= 2 && player2.length >= 2 && player1 !== player2) {
    createGame(player1, player2, io);
  } else {
    Logger.warn('Error ' + player1 + ' vs. ' + player2);
  }
};

function createGame(player1, player2, io) {
  Logger.info('Creating Game: ' + player1 + ' vs. ' + player2);
  PlayerMethods.create(player1, io);
  PlayerMethods.create(player2, io);

  return new Game({
    player1 : GameHelper.formatName(player1),
    player2 : GameHelper.formatName(player2)
  }).save();
}

/* Add a game vs the winner of another game to the queue */
exports.playWinner = function (player1, gameId, io) {
  player1 = GameHelper.formatName(player1);
  var result = Game.findById(gameId);
    result.then(function (parentGame) {
      if (player1 !== parentGame.player1 && player1 !== parentGame.player2) {
        var player2 = 'Winner of ' + parentGame.player1 + ' vs. ' + parentGame.player2;
        if (player1.length >= 2 && player2.length >= 2 && player1 !== player2) {
        
          var createdGame = createGame(player1, player2, io);
          createdGame.then(function(game){
            Logger.info('Player ' + player1 + ' playing winner of game ' + parentGame._id);
            parentGame.childGameId = game._id;
            parentGame.save();
            Sockets.push(io);
          });
        } else {
          Logger.warn('Error ' + player1 + ' vs. ' + player2);
        }
      }
    });
};


/* Remove the game from the queue */
exports.abandon = function (gameId, io) {
  Game.findById(gameId, function (error, game) {
    if (error) {
      Logger.error('Problem finding game: ' + gameId + ' to abandon: ' + error);
    }
    Game.find({
      childGameId: gameId
    }).exec(function (error, games) {
      games.forEach(function (entry) {
        Logger.info('Removing child game from game: ' + entry._id);
        entry.childGameId = undefined;
        entry.save();
      });
    });
    if (game & game.childGameId) {
      exports.abandon(game.childGameId, io);
    }
    Logger.info('Abandon game: ' + game._id + ' - ' + game.player1 + ' vs. ' + game.player2);
    game.winner = 'Abandoned';
    game.save();

    GameHelper.removeInactivePlayer(game.player1);
    GameHelper.removeInactivePlayer(game.player2);
    Game.findById(gameId).remove().exec();

    Sockets.push(io);
  });
};

/* Complete a game */
exports.complete = function (gameId, winner, io) {
  Game.findById(gameId, function (error, game) {
    if (error) {
      Logger.error('Problem finding game: ' + gameId + ', with the winner: ' + winner + ' to complete game: ' + error);
    }
    if (game.winner) {
      Sockets.push(io);
      updateChildGame(game);
    } else {
      game.winner = winner;
      game.save();
      var loser = game.player2;
      if (game.player1 !== winner) {
        loser = game.player1;
      }

      Player.find({
        name: {
          $in: [winner, loser]
        }
      }, function (error, players) {
        if (players[0].name == winner) {
          GameHelper.updatePlayers(players[0], players[1], io);
        } else {
          GameHelper.updatePlayers(players[1], players[0], io);
        }
      });
      updateChildGame(game, io);
      Sockets.push(io);
    }
  });
};

function updateChildGame(game, io) {
  if (game.childGameId !== undefined) {
    Game.findById(game.childGameId, function (error, childGame) {
      if (error) {
        Logger.error('Problem finding child game: ' + game.childGameId);
      } else {
        var originalPlayer = childGame.player2;
        childGame.player2 = game.winner;
        childGame.save();
        GameHelper.removeInactivePlayer(originalPlayer);
        Sockets.push(io);
      }
    });
  }
}