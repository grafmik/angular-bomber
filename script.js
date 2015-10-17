var app = angular.module('angularbomber', [])

app.controller('BomberController', ['$scope', function BomberController($scope) {
    var SPRITE_WIDTH = 5;
    var SPRITE_HEIGHT = 5;
    var SPRITE_NB_ON_X = Math.floor(100 / SPRITE_WIDTH);
    var SPRITE_NB_ON_Y = Math.floor(100 / SPRITE_HEIGHT);

    var getRandomColor = function getRandomColor() {
        var letters = '0123456789ABCDEF'.split('');
        var color = '#';
        for (var i = 0; i < 6; i++ ) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }

    var randomizeBuildings = function randomizeBuildings() {
        var result = [];
        for (var xIndex = 0; xIndex < SPRITE_NB_ON_X; xIndex++) {
            result.push({
                height: Math.floor(Math.random() * SPRITE_NB_ON_Y),
                color: getRandomColor()
            });
        }
        return result;
    };

    var reprocessBuildingsToDisplay = function reprocessBuildingsToDisplay() {
        var result = [];
        angular.forEach($scope.buildings, function (building, xIndex){
            for (var yIndex = 0; yIndex < building.height; yIndex++) {
                var buildingFloor = {
                    x: xIndex,
                    y: yIndex,
                    style: {
                        left : (xIndex * SPRITE_WIDTH) + "%",
                        bottom : (yIndex * SPRITE_HEIGHT) + "%",
                        height: SPRITE_HEIGHT + "%",
                        width: SPRITE_WIDTH + "%",
                        "background-color" : building.color
                    },
                    color: building.color
                }
                result.push(buildingFloor);
            }
        });
        $scope.buildingsToDisplay = result;
    };

    var reprocessSpriteToDisplay = function reprocessSpriteToDisplay(sprite) {
        sprite.style = {
            left : (sprite.x * SPRITE_WIDTH) + "%",
            bottom : ((sprite.y - 1) * SPRITE_HEIGHT) + "%",
            height: SPRITE_HEIGHT + "%",
            width: SPRITE_WIDTH + "%"
        };
        // TODO : why is it needed to refresh plane??
        $scope.$apply();
    };

    var launchBomb = function launchBomb() {
        if ($scope.plane.active && !$scope.bomb.active) {
            if ($scope.plane.y > 0) {
                $scope.bomb.active = true;
                $scope.bomb.x = $scope.plane.x;
                $scope.bomb.y = $scope.plane.y - 1;
                reprocessSpriteToDisplay($scope.bomb);
            }
        }
    };

    var stopGameEngine = function stopGameEngine() {
        clearInterval($scope.intervalID);
        $scope.gamestopped = true;
    };

    $scope.isMessageDisplayed = function isMessageDisplayed() {
        return ($scope.gameover || $scope.levelfinished);
    }

    $scope.getMessageDisplayed = function getMessageDisplayed() {
        var result = "";
        if ($scope.gameover) {
            result = "game over";
        } else if ($scope.levelfinished) {
            result = "level finished";
        }
        return result;
    }

    $scope.mainClic = function mainClic() {
        if ($scope.gamestopped) {
            initGame();
        } else {
            launchBomb();
        }
    }

    $scope.gameengine = function() {
        var target = undefined;
        if ($scope.plane.y > 0) {
            // plane processing
            if ($scope.plane.active) {
                target = $scope.buildings[$scope.plane.x];
                if ($scope.plane.crashed) {
                    // plane is destroying building floor, killing top-level employees
                    if (target !== undefined) {
                        target.height--;
                        reprocessBuildingsToDisplay();
                    }
                    $scope.plane.active = false;
                    $scope.gameover = true;
                } else {
                    if (target !== undefined && target.height === $scope.plane.y) {
                        $scope.plane.crashed = true;
                    } else if ($scope.plane.x < SPRITE_NB_ON_X - 1) {
                        // plane planes
                        $scope.plane.x++;
                    } else {
                        // plane is restarting from left side
                        $scope.plane.x = 0;
                        $scope.plane.y--;
                        $scope.plane.active = false;
                    }
                }
                reprocessSpriteToDisplay($scope.plane);
            } else {
                if (!$scope.bomb.active) {
                    $scope.plane.active = true;
                    reprocessSpriteToDisplay($scope.plane);
                }
            }
            // bomb processing
            if ($scope.bomb.active) {
                // building destroying
                target = $scope.buildings[$scope.bomb.x];
                if (target !== undefined && target.height === $scope.bomb.y) {
                    target.height--;
                    reprocessBuildingsToDisplay();
                }
                if ($scope.bomb.y > 1) {
                    // bomb is bombing
                    $scope.bomb.y--;
                } else {
                    // bomb has bombed
                    $scope.bomb.active = false;
                }
                reprocessSpriteToDisplay($scope.bomb);
            }
        } else {
            $scope.levelfinished = true;
            stopGameEngine();
            //TODO message won't display, can't figure out why
            $scope.$apply();
        }
        if ($scope.plane.crashed && !$scope.plane.active && !$scope.bomb.active) {
            stopGameEngine();
        }
    };

    var initGame = function initGame() {
        $scope.buildings = randomizeBuildings();
        reprocessBuildingsToDisplay();
        $scope.plane = {
            active: true,
            crashed: false,
            x: 0,
            y: SPRITE_NB_ON_Y
        };
        $scope.bomb = {
            active: false
        };
        $scope.gameover = false;
        $scope.levelfinished = false;
        $scope.gamestopped = false;
        $scope.intervalID = setInterval(function() { $scope.gameengine(); }, 150);
    };

    initGame();
}]);

