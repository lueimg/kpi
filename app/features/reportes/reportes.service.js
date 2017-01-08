
angular
  .module('doc.features')
  .factory('ReportesSvc', ['$resource','ServicesConfig', function ($resource, ServicesConfig) {
    var Reportes = $resource(ServicesConfig.url + '/Reports/:ID', {ID: '@ID'},
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