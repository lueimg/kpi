
angular
  .module('doc.features')
  .factory('CommentSvc', ['$resource','ServicesConfig', function ($resource, ServicesConfig) {
    var Comment = $resource(ServicesConfig.url + '/Comments/index.php?key=:key', {key: '@key'},
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