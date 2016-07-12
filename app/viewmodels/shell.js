define(["require", "exports", 'durandal/app', 'plugins/router', '../datamodels/eventTypes', '../datamodels/gamedata', '../services/socketservice', 'knockout'], function (require, exports, app, router, eventTypes, gamedata, SocketService, ko) {
    "use strict";
    var Shell = (function () {
        function Shell() {
            this.router = router;
            this.activate = function () {
                this.socketService.Start();
            };
            this.attached = function () {
                // $(window).focus(function () {
                //     socket.emit('update all');
                // });
                this.socketService.Initialise();
            };
            this.socketService = new SocketService();
            var _this = this;
            _this.HasQueue = ko.computed(function () {
                return gamedata.Games().length > 1;
            });
            _this.HasWaiting = ko.computed(function () {
                return gamedata.PlayersWaiting().length > 1;
            });
            app.on(eventTypes.PlayerDataUpdate).then(function (eventData) {
                gamedata.Players(eventData);
            });
            app.on(eventTypes.GamesDataUpdate).then(function (eventData) {
                gamedata.Games(eventData);
            });
            app.on(eventTypes.WaitingListUpdate).then(function (eventData) {
                gamedata.PlayersWaiting(eventData);
            });
            app.on(eventTypes.StatsDataUpdate).then(function (stats) {
                if (!stats.player)
                    return;
                $('#modalLabel').text(stats.player.name);
                $('#modalContent').html(formatPlayerlayerStats(stats));
            });
        }
        return Shell;
    }());
    function formatPlayerlayerStats(stats) {
        last10games(stats.last10games);
        return '<div class="row">' +
            '<div class="text-center">' +
            '&nbsp;&nbsp;&nbsp;&nbsp;(Wins) ' + stats.player.wins + '&nbsp; - &nbsp;' +
            stats.player.losses + ' (Losses)' +
            '</div>' +
            '</div>' +
            '<div class="row">' +
            '<div class="col-xs-6 text-right">' +
            'Win %:' +
            '</div>' +
            '<div class="col-xs-6 text-left">' +
            getWinPercentage(stats.player) + ' %' +
            '</div>' +
            '</div>' +
            '<div class="row">' +
            '<div class="col-xs-6 text-right">' +
            'Elo:' +
            '</div>' +
            '<div class="col-xs-6 text-left">' +
            stats.player.elo +
            '</div>' +
            '</div>' +
            '<div class="row">' +
            '<div class="col-xs-6 text-right">' +
            'Last 10:' +
            '</div>' +
            '<div class="col-xs-6 text-left">' +
            last10games(stats.last10games) +
            '</div>' +
            '</div>' +
            '<div class="row">' +
            '<div class="col-xs-6 text-right">' +
            'Win Streak:' +
            '</div>' +
            '<div class="col-xs-6 text-left">' +
            stats.winStreak +
            '</div>' +
            '</div>' +
            '<div class="row">' +
            '<div class="col-xs-6 text-right">' +
            'Most Played:' +
            '</div>' +
            '<div class="col-xs-6 text-left">' +
            stats.playerMostPlayed.player + ' (' + stats.playerMostPlayed.games + ')' +
            '</div>' +
            '</div>';
    }
    function getWinPercentage(player) {
        if (player.wins > 0 || player.wins > 0) {
            return Math.round(player.wins / (player.wins + player.losses) * 100);
        }
        else {
            return '0';
        }
    }
    function last10games(games) {
        var gameString = '';
        for (var i = 0; i < games.length; i++) {
            if (games[i]) {
                gameString += '<span class="text-success">W</span>';
            }
            else {
                gameString += '<span class="text-danger">L</span>';
            }
        }
        return gameString;
    }
    return Shell;
});
//# sourceMappingURL=shell.js.map