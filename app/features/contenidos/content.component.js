var ContentCtrl = function (notification, ServicesConfig, ContentSvc, $routeParams, ReportesSvc, $location, $q) {
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
      },
      vm = this;

      vm.SeriesAvailables = [];
      
    vm.backToList = () => $location.path('/contenidos');
    let reportPromise = ReportesSvc.query(response => {
       vm.reports = response.results.list;
    });
    vm.reportChange = () => {
      vm.content.SUBREPORT_ID = undefined;
      vm.subreports = [];
      if (vm.content.REPORT_ID) 
        vm.updateSubReportList(vm.content.REPORT_ID)
    };

    vm.updateSubReportList = (report_id) => {
      vm.subreports = vm.reports.find( report => report.ID == report_id).SUBREPORTS_ROWS;
    }

    vm.content = new ContentSvc();
    vm.content.graphs = [];

    vm.addGraph = () => {
      if (!vm.content.PROCEDURE) {
        notification.warn("Por favor agregue un store procedure antes de agregar un grafico")
        return false;
      }
      // Verificar Procedure y series 
      ContentSvc.verifySeries({
        anio: 2017,
        semana: 1,
        antiguedad: vm.content.WEEKSRANGE || 10,
        procedure: vm.content.PROCEDURE || 'sp_test'
      }, (response) => {
        notification.great(`Se encontraron ${response.results.length} series en el Store procedure`)
        vm.SeriesAvailables = response.results.map((item) => {
          return {
            NAME_FROM_PROCEDURE: item,
            SERIE_NAME: item
          }
        });
        
        vm.content.graphs.push( { series: vm.SeriesAvailables  } );
      }, (error) => {
        notification.error("Hubo un error con el Store procedure usado.")
        console.log(error);
      });
      
    };
    vm.removeGraph = (index) => vm.content.graphs.splice(index, 1);

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
    
    

    $q.all([reportPromise.$promise]).then(function() {
      // console.log("ALL PROMISES RESOLVED");
      if (id) {
        ContentSvc.get({ID: id}, (response) => {
          vm.content = response.results;
          vm.updateSubReportList(vm.content.REPORT_ID)
        });
      }
    });
}

angular.module('doc.features').component('contentComponent', {
  template: require('./content.component.html'),
  controller: ['notification', 'ServicesConfig','ContentSvc', '$routeParams', 'ReportesSvc', '$location','$q', ContentCtrl],
  bindings: {}
});