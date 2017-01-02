(function () {
  angular
    .module('doc.features')
    .factory('Kpi', ['$resource', function ($resource) {
      var Kpi = $resource('/Api/kpi/:idkpi', {idkpi: '@idkpi'},
        {
          query: {
            isArray: false
          },
          update: {
            method: 'PUT'
          }
        });

      return Kpi;
    }]);
})();
