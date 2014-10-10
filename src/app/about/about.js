angular.module( 'ngBoilerplate.about', [
  'ui.router',
  'placeholders',
  'ui.bootstrap'
])
.config(function config( $stateProvider ) {
  $stateProvider.state( 'about', {
    url: '/about',
    views: {
      "main": {
        controller: 'AboutCtrl',
        templateUrl: 'about/about.tpl.html'
      }
    },
    data:{ pageTitle: 'What is It?' }
  });
})
.config([
  '$stateProvider',
  function config($stateProvider) {
    $stateProvider.state('about', {
      url: '/about',
      views: {
        'main': {
          controller: 'AboutCtrl',
          templateUrl: 'about/about.tpl.html'
        }
      },
      data: { pageTitle: 'What is It?' }
    });
  }
])
.factory('d3Service', ['$document', '$q', '$rootScope',
    function($document, $q, $rootScope) {
        var d = $q.defer();
        function onScriptLoad() {
            // Load client in the browser
            $rootScope.$apply(function() { d.resolve(window.d3); });
        }
        // Create a script tag with d3 as the source
        // and call our onScriptLoad callback when it
        // has been loaded
        var scriptTag = $document[0].createElement('script');
        scriptTag.type = 'text/javascript';
        scriptTag.async = true;
        scriptTag.src = 'http://d3js.org/d3.v3.min.js';

        scriptTag.onreadystatechange = function () {
            if (this.readyState == 'complete') {
                onScriptLoad();
            }
        };

        scriptTag.onload = onScriptLoad;

        var s = $document[0].getElementsByTagName('body')[0];
        s.appendChild(scriptTag);

        return {
            d3: function() { return d.promise; }
        };
    }])

.service('d3HttpService', function($q, $http) {
    var d3HttpService = {
        methods: {
            GET: 'GET',
            POST: 'POST'
        },
        getRandomScores: function(count) {
            var deferred = $q.defer();
            var url = "http://www.filltext.com";
            var params = {
                rows      : count || 10,
                scores    : '{randomNumber|100}',
                lastName  : '{lastName}',
                firstName : '{firstName}'
            };

            $http({
                method: d3HttpService.methods.GET,
                url: url,
                params: params
            }).success(function(data) {
                // @TODO: Convert into defined resultSet models
                deferred.resolve(data);
            }).error(function(error) {
                // @TODO: Convert into a pre-defined resultSet
                deferred.reject(error);
            });

            return deferred.promise;
        }
    };
    return d3HttpService;
})

.directive('scoreChart', function(d3Service, d3HttpService) {
    return {
        restrict: 'EA',
        link: function(scope, elem, attr, ngModel) {
            var colorize = function(score) {
                return score < 255 ? "red" : "green";
            };

            var barMarginTop = 40,
                barHeight = 20,
                barPadding = 10,
                barWidth = function(score) {
                    var _returnValue = parseInt((score + 100 + 100), 10);
                    return _returnValue;
                };

            d3Service.d3().then(function(d3) {
                d3HttpService.getRandomScores(scope.count).then(function(scoresResponse) {
                    var svgElement = d3.select(_.first(elem))
                        .append('svg')
                        .style('width', '100%')
                        .style('height', function() {
                            return (scoresResponse.length * 20 + 500);
                        })
                        .attr('class', 'graphs-parent-element');
                    
                    svgElement.selectAll('rect')
                        .data(scoresResponse).enter()
                        .append('rect')
                        .attr('class', function(scoreResponse) {
                            return colorize(barWidth(scoreResponse.scores));
                        })
                        .attr('height', barHeight)
                        .attr('x', 10)
                        .attr('y', function(scoreResponse, index, context) {
                            var initialValue = (index * barHeight);
                            initialValue = (index + initialValue + barMarginTop);
                            return initialValue;
                        })
                        .attr('fill', function(user) {
                            console.log(colorize(barWidth(user.scores)));
                            return colorize(barWidth(user.scores));
                        })
                        .attr('width', function(user) {
                            return barWidth(user.scores);
                        });

                    svgElement.selectAll('text')
                        .data(scoresResponse).enter()
                        .append('text')
                        .attr('fill', '#fff')
                        .text(function(user) {
                            return user.firstName + " " + user.lastName + ": " + user.scores ;
                        })
                        .attr('x', 15)
                        .attr('y', function(user, index, context) {
                            var initialValue = (index * barHeight);
                            initialValue = (index + initialValue + barMarginTop);
                            return (initialValue + 15);
                        });
                }, function(error) {
                    console.log('d3HttpService', error);
                });
            }, function() {
                console.log('failed to load the d3 service');
            });
        },
        scope: {
            count: '='
        }
    };
})
.controller( 'AboutCtrl', function AboutCtrl( $scope ) {
})

;
