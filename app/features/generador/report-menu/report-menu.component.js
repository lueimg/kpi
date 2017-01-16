var Controller = function (GeneradorSvc) {
    var vm = this;

    GeneradorSvc.getReportsMenu((response) =>{
        vm.data = response.results.list;
    });
}

angular.module('doc.features').component('reportMenuComponent', {
  template: require('./report-menu.component.html'),
  controller: ['GeneradorSvc', Controller],
  bindings: {
      report: "<",
      onClick: "&"
  }
});