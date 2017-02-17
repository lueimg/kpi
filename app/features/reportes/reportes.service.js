
angular
  .module('doc.features')
  .factory('ReportesSvc', ['$resource','ServicesConfig', function ($resource, ServicesConfig) {
    var Reportes = $resource(ServicesConfig.url + '/reports/index.php?reportId=:ID', {ID: '@ID'},
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