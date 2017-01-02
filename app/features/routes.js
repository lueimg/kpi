(function () {
  angular.module('doc.features')
    .config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
      $locationProvider.html5Mode(false).hashPrefix('');
      $routeProvider
        .when('/', {
          template: require('./records/records.html'),
          controller: 'RecordsCtrl'
        });

        

    }]);
})();
