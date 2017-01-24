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
        let message = err.message || err.data.message;
        notification.error(message);
      },
      preValidation = function () {
      
        return true;
      };
      
  vm.isDisabled = false;
  vm.reporte = new ReportesSvc();
  vm.reporte.sub = [];
  if (id) {
    ReportesSvc.get({ID: id}, function (res) {
      vm.reporte = res.results;
      vm.reporte.sub = vm.reporte.sub || [];
    });
  } 

  vm.addSubReport = function () {
    vm.reporte.sub.push({NAME: ''});
  };
  vm.removeSubReport = function (index) {
    vm.reporte.sub.splice(index, 1);
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