function ReportesFormComponentCtrl($filter, $location, $routeParams, Reportes,notification) {
  var vm = this;

  var id = $routeParams.id,
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

  if (id) {
    vm.reportes = reportes.get({id: id});
  } else {
    vm.reportes = new Reportes();
  }

  vm.backToList = function () {
    $location.path('/reportes');
  };

  vm.save = function (form) {
    vm.isDisabled = true;
    if (preValidation()) {
      if (form.$valid) {
        if (!id) {
          vm.reportes.$save(successHandler, errorHandler);
        } else {
          vm.reportes.$update({id: id}, successHandler, errorHandler);
        }
      } else {
        vm.isDisabled = false;
        notification.warn('Debe llenar todos los campos obligatorios');
      }
    }
    vm.isDisabled = false;
  };
}

angular.module('doc.features').component('reportesFormComponent', {
  template: require('./reportes-form.component.html'),
  controller: [
    '$filter',
    '$location',
    '$routeParams', 
    'Reportes',
    'notification', 
    ReportesFormComponentCtrl],
  bindings: {}
});