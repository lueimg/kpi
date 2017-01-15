
angular
  .module('doc.features')
  .factory('GeneradorSvc', ['$resource','ServicesConfig', function ($resource, ServicesConfig) {
    var Reportes = $resource(ServicesConfig.url + '/Generator/:ID', {ID: '@ID'},
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