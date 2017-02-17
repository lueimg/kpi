
angular
  .module('doc.features')
  .factory('GeneradorSvc', ['$resource','ServicesConfig', function ($resource, ServicesConfig) {
    var Generador = $resource(ServicesConfig.url + '/generator/index.php?id=:ID', {ID: '@ID'},
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
          url: ServicesConfig.url + '/generator/index.php?reportsMenu=reportsMenu'

        },
        getAllContent : {
          isArray: false,
          method: 'GET',
          url: ServicesConfig.url + '/generator/index.php?allContent=allContent'

        }
      });

    return Generador;
  }]);