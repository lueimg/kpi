
angular
  .module('doc.features')
  .factory('GeneradorSvc', ['$resource','ServicesConfig', function ($resource, ServicesConfig) {
    var Generador = $resource(ServicesConfig.url + '/Generator/:ID', {ID: '@ID'},
      {
        query: {
          isArray: false
        },
        update: {
          method: 'PUT'
        },
        getReportsMenu : {
          isArray: false,
          method: 'GET',
          url: ServicesConfig.url + '/Generator/reportsMenu'

        }
      });

    return Generador;
  }]);