(function () {
  angular.module('doc.features')
    .config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
      $locationProvider.html5Mode(false).hashPrefix('');
      $routeProvider
        .when('/', { template: "<kpi-component></kpi-component>" })
        .when('/kpi', { template: "<kpi-component></kpi-component>" })
        .when('/kpi/create', { template: "<kpi-form-component></kpi-form-component>" })
        .when('/kpi/:id', { template: "<kpi-form-component></kpi-form-component>" });

    }]);
})();
