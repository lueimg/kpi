var ContentCtrl = function (notification, ServicesConfig) {
    var vm = this;

    vm.queries = [];
    vm.addQuery = () => {
      vm.queries.push('');
    };

    vm.removeQuery = (index) =>{
      vm.queries.splice(index, 1);
    };

    vm.graphs = ['',];
    vm.addGraph = () => {
      vm.graphs.push('');
    };

    vm.removeGraph = (index) =>{
      vm.graphs.splice(index, 1);
    };


}

angular.module('doc.features').component('contentComponent', {
  template: require('./content.component.html'),
  controller: ['notification', 'ServicesConfig', ContentCtrl],
  bindings: {}
});