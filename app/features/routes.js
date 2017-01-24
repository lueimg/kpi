(function () {
  angular.module('doc.features')
    .config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
      $locationProvider.html5Mode(false).hashPrefix('');
      $routeProvider
        .when('/', { template: "<reportes-component></reportes-component>" })
        .when('/reportes', { template: "<reportes-component></reportes-component>" })
        .when('/reportes/create', { template: "<reportes-form-component></reportes-form-component>" })
        .when('/reportes/:id', { template: "<reportes-form-component></reportes-form-component>" })
        .when('/contenidos', { template: "<content-list-component></content-list-component>" })
        .when('/contenidos/create', { template: "<content-component></content-component>" })
        .when('/contenidos/:id', { template: "<content-component></content-component>" })
        .when('/generador', { template: "<generador-component></generador-component>" })
        .when('/comentarios', { template: "<comments-component></comments-component>" })
        .when('/exportador', { template: "<exportador-component></exportador-component>" })
    }]);
})();
