

angular.module('App').controller('InfluencersCtrl', ['$scope', '$http','$window', function($scope, $http, $window) {
  $scope.loadData = function(urlStem) {
    $http.get(urlStem + 'authors.json').success(function(data) {
      $scope.influencers = data.influencers.sort(influencerSort);
      $scope.smallScreen = false;
    });
  }

  // "period":{"born":"","death":"", "circa":""}
  $scope.periodDetail = function(influencer) {
    var s = "Unknown";
    if (influencer.period.circa) {
        s = "Circa: " + influencer.period.circa;
    } else {
      var born = "Unknown", death = "";
      if (influencer.period.born) {
        born = "" + influencer.period.born;
      }
      if (influencer.period.death) {
        death = "" + influencer.period.death;
      }
      s = born + " - " + death;
    }
    return s;
  }

  $scope.popupShow = function(id) {
      angular.element(document.querySelector("#tw-authors-table")).css({
        'display': 'none'
      });
      angular.element(document.querySelector(id)).css({
        'display': 'block'
      });
  };

  $scope.popupHide = function(id) {
    angular.element(document.querySelector("#tw-authors-table")).css({
      'display': 'block'
    });
    angular.element(document.querySelector(id)).css(
      {'display':'none'}
    );
  };

  $scope.showNotes = function(influencer,popupId) {

    $scope.selectedInfluencer = influencer;

    $scope.popupShow(popupId);
  };

}]);


// "period":{"born":"","death":"", "circa":""}
function influencerSort(x,y) {
    function sortTerm(e) {
      if (e.period.born) return e.period.born;
      if (e.period.death) return e.period.death;
      if (e.period.circa) return e.period.circa;
      return 9999;
    }
    return sortTerm(x) - sortTerm(y);
}
