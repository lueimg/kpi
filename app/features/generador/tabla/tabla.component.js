var Controller = function ($scope) {
    var vm = this;
    vm.isLoading = false;

    vm.$onInit = () => {
        vm.isLoading = true;
    }
}

angular.module('doc.features').component('tablaComponent', {
  template: require('./tabla.component.html'),
  controller: ['$scope', Controller],
  bindings: {
      data: "<",
      hideComments: '<',
      charId: '@'
  }
});