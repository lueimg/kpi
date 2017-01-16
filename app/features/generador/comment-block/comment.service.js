
angular
  .module('doc.features')
  .factory('CommentSvc', ['$resource','ServicesConfig', function ($resource, ServicesConfig) {
    var Comment = $resource(ServicesConfig.url + '/Comments/:key', {key: '@key'},
      {
        query: {
          isArray: false
        },
        update: {
          method: 'PUT'
        }
      });

    return Comment;
  }]);