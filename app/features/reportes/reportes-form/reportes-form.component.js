function ReportesFormComponentCtrl($filter, $location, $routeParams, ReportesSvc,notification) {
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
  vm.reporte = new ReportesSvc();
  vm.reporte.subreports = [];
  if (id) {
    ReportesSvc.get({ID: id}, function (res) {
      vm.reporte = res.results;
      vm.reporte.subreports = vm.reporte.subreports || [];
    });
  } 

  vm.addSubReport = function () {
    vm.reporte.subreports.push('');
  };
  vm.removeSubReport = function (index) {
 
    vm.reporte.subreports.splice(index, 1);
  };

  vm.backToList = function () {
    $location.path('/reportes');
  };

  vm.save = function (form) {
    vm.isDisabled = true;
    if (preValidation()) {
      if (form.$valid) {
        if (!id) {
          vm.reporte.$save(successHandler, errorHandler);
        } else {
         ReportesSvc.update(vm.reporte, successHandler, errorHandler);
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
    'ReportesSvc',
    'notification', 
    ReportesFormComponentCtrl],
  bindings: {}
});