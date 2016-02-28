//javascript/app.js

angular.module('App', [])
  .controller('TradSetCtrl', ['$scope', '$http','$window', function($scope, $http, $window) {
    $scope.randomPickHistory = [];
    $scope.selectedSet = null;
    $scope.randomPickMode = false;

    $scope.loadTuneData = function(tradsetsUrlStem) {
      $http.get(tradsetsUrlStem + 'sets.json').success(function(data) {
        $scope.tradSets = data.sets;
        $scope.showTradSets = $scope.tradSets;
        $scope.smallScreen = false;


        var mkeys = [];
        var tuneTypes = [];
        var setYears = [];
        var setCount = 0;
        var tuneCount = 0;
        _.each($scope.tradSets,function(s){
              setCount++;
              _.each(s.tunes,function(t){
                  tuneCount++;
                  mkeys.push(t.key);
                  tuneTypes.push(t.type);
              });
              setYears.push(s.since);
        });
        $scope.tunecount=tuneCount;
        $scope.setcount=setCount;
        $scope.mkeys = _.uniq(mkeys);
        $scope.tuneTypes = _.uniq(tuneTypes);
        $scope.setYears = _.uniq(setYears);
      });
      $scope.selectKeyIdx = -1;
      $scope.selectTuneTypeIdx = -1;
    };


    $scope.filterTunes = function(field,idx) {
        var v = null;
        if (field === "KEY") {
          $scope.selectKeyIdx = idx;
          v = $scope.mkeys[idx];
        } else if (field === "TUNETYPE") {
          $scope.selectTuneTypeIdx = idx;
          v = $scope.tuneTypes[idx];
        }
        $scope.showTradSets = [];
        _.each($scope.tradSets,function(s){
          var found = false;
          _.each(s.tunes,function(t){
            var keyCond = $scope.selectKeyIdx === -1 || t.key ==  $scope.mkeys[$scope.selectKeyIdx];
            var tuneTypeCond = $scope.selectTuneTypeIdx === -1 || t.type == $scope.tuneTypes[$scope.selectTuneTypeIdx];
            if (!found) {
              found = keyCond && tuneTypeCond;
            }
          });

          if (found) {
            $scope.showTradSets.push(s);
          }
        });
    };

    $scope.popupShow = function(id) {
      $scope.smallScreen = $window.innerWidth < 900;
        angular.element(document.querySelector(id)).css({
          'display': 'block'
        });

        angular.element(document.querySelector("#tw-tune-table")).css({
          'display': 'None'
        });
    };
    $scope.popupHide = function(id) {
      angular.element(document.querySelector(id)).css(
        {'display':'none'}
      );
      angular.element(document.querySelector("#tw-tune-table")).css({
        'display': 'block'
      });
    };

    $scope.selectSetYearIdx = -1;
    $scope.selectRandomYear = function(yearIdx) {
      $scope.selectSetYearIdx = yearIdx;
    }

    $scope.showSet = function(set) {
      $scope.selectedSet = set;
      $scope.popupShow("#tw-set-details-popup");
    }

    $scope.pickRandomSet = function() {
        var randomDomain = $scope.tradSets;
        if ($scope.selectSetYearIdx !== -1) {
          randomDomain = _.filter($scope.tradSets,function(set){
                     return set.since <= $scope.setYears[$scope.selectSetYearIdx];
                });
        }
        var randomDomainWithoutHistory =
            _.filter(randomDomain,function(set){
              return(!_.contains($scope.randomPickHistory,set.setNumber));
            });
        if (randomDomainWithoutHistory.length > 0) {
          var rIndex = _.random(0, randomDomainWithoutHistory.length-1);
          $scope.selectedSet = randomDomainWithoutHistory[rIndex];
          $scope.selectedSet.randomPicked = true;
          $scope.randomPickHistory.push($scope.selectedSet.setNumber);
          console.log("selected Set:" + $scope.selectedSet.setNumber + " Since: " + $scope.selectedSet.since);
        } else {
          $scope.selectedSet = null;
          console.log("Alls sets have been previously picked");
        }
        $scope.popupShow("#tw-set-details-popup");
    }

  }]);

  angular.module('App').config(function($interpolateProvider) {
     $interpolateProvider.startSymbol('[[');
     $interpolateProvider.endSymbol(']]');
   });
