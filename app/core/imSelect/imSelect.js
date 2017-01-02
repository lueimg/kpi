import './imSelect.scss';

angular
  .module('doc.features')
  .directive('imSelect', function () {
    return {
      restrict: 'E',
      template: require('./imSelect.html'),
      scope: {
        config: '='
      },
      controller: ['$scope',
      function ($scope) {
        var vm = $scope;

        vm.defaultConfig = {
          method: 'GET',
          params: {
            name: ''
          },
          paginationConfig: {
            response: {
              totalItems: 'results.count',
              itemsLocation: 'results.list'
            }
          }
        };

        vm.ajaxConfig = angular.extend(vm.defaultConfig, vm.config);

      }]
    };
  });
