
angular
  .module('doc.features')
  .factory('ReportesSvc', ['$resource','ServicesConfig', function ($resource, ServicesConfig) {
    var Reportes = $resource(ServicesConfig.url + '/Reports/:id', {id: '@id'},
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