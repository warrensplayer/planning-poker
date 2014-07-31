// JavaScript source code
// function () {

var cards = [0, 0.5, 1, 2, 3, 5, 8, 13, 20, 40, 100, "?", "coffee cup"];

var app = angular.module("PokerApp", []);

app.controller("MainCtrl", function ($scope, socket) {
    $scope.cardchoices = [];
    $scope.cardoptions = cards;
    $scope.params = {
        togglestart: true,
    };

    // Incoming
    socket.on('onCardCreated', function (data) { // B.3
        // Update if the same card. 
        for (var i = 0; i < $scope.cardchoices.length; i++) {
            if (data.name == $scope.cardchoices[i].name) {
                $scope.cardchoices.task = data.task;
                $scope.cardchoices.card = data.card;
                return true;
            }
        }

        $scope.cardchoices.push(data);
    });

    socket.on('onCardsDeleted', function () {
        $scope.cardchoices = [];
    });

    socket.on('onToggle', function (val) {
        $scope.params.togglestart = val;
    })
    
    // Outgoing
    $scope.createCard = function(data) { // B.4
        // Update if the same card
        for (var i = 0; i < $scope.cardchoices.length; i++) {
            if (data.name == $scope.cardchoices[i].name) {
                $scope.cardchoices.task = data.task;
                $scope.cardchoices.card = data.card;
                return true;
            }
        }

        $scope.cardchoices.push(data);
        socket.emit('createCard', data);
    };

    $scope.deleteCards = function () {
        $scope.cardchoices = [];
        socket.emit('deleteCards');
    };

    $scope.toggle = function (val) {
        $scope.params.togglestart = val;
        socket.emit('onToggle', val);
    }
});

app.factory('socket', function ($rootScope) {
    var socket = io.connect();
    return {
        on: function (eventName, callback) {
            socket.on(eventName, function () {
                var args = arguments;
                $rootScope.$apply(function () {
                    callback.apply(socket, args);
                });
            });
        },
        emit: function (eventName, data, callback) {
            socket.emit(eventName, data, function () {
                var args = arguments;
                $rootScope.$apply(function () {
                    if (callback) {
                        callback.apply(socket, args);
                    }
                });
            });
        }
    };
});

app.directive('pokercards', function (socket) {
    var controller = function ($scope) {
        // Incoming
        socket.on('onCardUpdated', function (data) {
            // Update if the same note
            if (data.name == $scope.cardchoices.name) {
                $scope.cardchoices.task = data.task;
                $scope.cardchoices.card = data.card;
            }
        });

        // Outgoing
        $scope.updateCard = function (card) {
            socket.emit('updateCard', card);
        };

        $scope.deleteCards = function () {
            $scope.ondelete({  });
        };
    };

    return {
        restrict: 'A',
        controller: controller,
        scope: {
            card: '=',
            ondelete: '&'
        }
    };
});

// })();
