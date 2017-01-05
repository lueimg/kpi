(function () {
  angular
    .module('doc.features')
    .factory('Reportes', ['$resource', 'servicesConfig', function ($resource, ServicesConfig) {
      var Reportes = $resource(ServicesConfig.url + '/reportes/:id', {id: '@id'},
        {
          query: {
            isArray: false
          },
          update: {
            method: 'PUT'
          }
        });

      return Reportes;
    }]);
})();
