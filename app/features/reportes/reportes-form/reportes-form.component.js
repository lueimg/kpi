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

  if (id) {
    vm.reporte = ReportesSvc.get({id: id});
  } else {
    vm.reporte = new ReportesSvc();
  }




  vm.reporte.subreports = [];

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
          vm.reporte.$update({id: id}, successHandler, errorHandler);
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