function KpiFormComponentCtrl($filter, $location, $routeParams, Kpi,notification) {
  var vm = this;

  var idkpi = $routeParams.id,
      successHandler = function () {
        vm.isDisabled = false;
        vm.backToList();
        notification.great('Guardado correctamente');
      },
      errorHandler = function (err) {
        vm.isDisabled = false;
        notification.error(err.data.message);
      },
      preValidation = function () {
      
        return true;
      };

  vm.isDisabled = false;

  if (idkpi) {
    vm.kpi = Kpi.get({idkpi: idkpi});
  } else {
    vm.kpi = new Kpi();
  }

  vm.backToList = function () {
    $location.path('/kpi');
  };

  vm.save = function (form) {
    vm.isDisabled = true;
    if (preValidation()) {
      if (form.$valid) {
        if (!idkpi) {
          vm.kpi.$save(successHandler, errorHandler);
        } else {
          vm.kpi.$update({idkpi: idkpi}, successHandler, errorHandler);
        }
      } else {
        vm.isDisabled = false;
        notification.warn('Debe llenar todos los campos obligatorios');
      }
    }
    vm.isDisabled = false;
  };
}

angular.module('doc.features').component('kpiFormComponent', {
  template: require('./kpi-form.component.html'),
  controller: [
    '$filter',
    '$location',
    '$routeParams', 'Kpi',
    'notification', KpiFormComponentCtrl],
  bindings: {}
});