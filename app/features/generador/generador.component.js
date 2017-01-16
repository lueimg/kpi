var GeneradorCtrl = function (ReportesSvc, GeneradorSvc) {
    var vm = this;
    vm.isLoading = false;
    vm.filtros = {
        year : moment().format('YYYY') * 1,
        week: '52',
        content_id: 86
    };
    vm.yearList = [];
    vm.getYearList = () => {
        let lastYear = moment().format('YYYY') * 1 ;
        for(let i = lastYear; i  > 1980 ; i--) { vm.yearList.push(i); }
    };

    vm.weekList = [];
    vm.getWeeksList = () => { for(let i = 1; i  < 53  ; i++) { vm.weekList.push({id: i, text: `Semana ${i}`}); }  };
    vm.getYearList();
    vm.getWeeksList();

    ReportesSvc.query((response)=> vm.reports = response.results.list);
    vm.selectContent = (content_id) => {};

    vm.graphics = [];
    vm.xAxis = [];
    vm.dataSeries = [];
    vm.generateContent = () => {
        vm.isLoading = true;
        GeneradorSvc.get(vm.filtros, (response) => {
            vm.graphics = response.results.graphics;
            vm.xAxis = response.results.xAxis;
            vm.dataSeries = response.results.dataSeries;
        });

    };

     vm.generateContent();
}

angular.module('doc.features').component('generadorComponent', {
  template: require('./generador.component.html'),
  controller: ["ReportesSvc", 'GeneradorSvc', GeneradorCtrl],
  bindings: {}
});