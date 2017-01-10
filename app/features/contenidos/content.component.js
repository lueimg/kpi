var ContentCtrl = function (notification, ServicesConfig, ContentSvc, $routeParams, ReportesSvc, $location) {
    var id = $routeParams.id,
      successHandler = function () {
        vm.isDisabled = false;
        $vm.backToList();
        notification.great('Guardado correctamente');
      },
      errorHandler = function (err) {
        vm.isDisabled = false;
        notification.error(err.data.message);
      },
      preValidation = function () {
      
        return true;
      },
      vm = this;
      
    vm.backToList = () => $location.path('/contenidos');

    ReportesSvc.query((response) => {
      vm.reports = response.results.list;
    });
    vm.reportChange = () => {
      vm.content.SUBREPORT_ID = null;
      if (vm.content.REPORT_ID) 
        vm.subreports = vm.reports.find( report => report.ID == vm.content.REPORT_ID).SUBREPORTS_ROWS;
      else {
         vm.subreports = [];
      }
    };

    vm.content = new ContentSvc();
    vm.content.queries = [];
    vm.content.graphs = [];

    vm.addQuery = () => vm.content.queries.push('');
    vm.removeQuery = (index) => vm.content.queries.splice(index, 1);

    vm.addGraph = () => vm.content.graphs.push({series: [{}]});
    vm.removeGraph = (index) => vm.content.graphs.splice(index, 1);

    // Depend of a graphic
    vm.addSerie = (series) => series.push({});
    vm.removeSerie = (series, index) => series.splice(index, 1);

    vm.save = function (form) {
        vm.isDisabled = true;
        if (preValidation()) {
          if (form.$valid) {
            if (!id) {
              vm.content.$save(successHandler, errorHandler);
            } else {
            ContentSvc.update(vm.content, successHandler, errorHandler);
            }
          } else {
            vm.isDisabled = false;
            notification.warn('Debe llenar todos los campos obligatorios');
          }
        }
        vm.isDisabled = false;
      };
}

angular.module('doc.features').component('contentComponent', {
  template: require('./content.component.html'),
  controller: ['notification', 'ServicesConfig','ContentSvc', '$routeParams', 'ReportesSvc', '$location', ContentCtrl],
  bindings: {}
});