(function () {
  angular.module('doc.features')
    .config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
      $locationProvider.html5Mode(false).hashPrefix('');
      $routeProvider
        .when('/', { template: "<reportes-component></reportes-component>" })
        .when('/reportes', { template: "<reportes-component></reportes-component>" })
        .when('/reportes/create', { template: "<reportes-form-component></reportes-form-component>" })
        .when('/reportes/:id', { template: "<reportes-form-component></reportes-form-component>" });

    }]);
})();
