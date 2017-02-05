
angular
  .module('doc.features')
  .factory('ContentSvc', ['$resource','ServicesConfig', function ($resource, ServicesConfig) {
    return  $resource(ServicesConfig.url + '/Content/:ID', {ID: '@ID'},
      {
        query: {
          isArray: false
        },
        update: {
          method: 'PUT'
        },
        verifyKpis: {
          isArray: false,
          method: 'POST',
          url: ServicesConfig.url + '/Content/verifyKpis'
        }

      });
  }]);