//javascript/app.js

angular.module('App', [])
  angular.module('App').config(function($interpolateProvider) {
     $interpolateProvider.startSymbol('[[');
     $interpolateProvider.endSymbol(']]');
   });
