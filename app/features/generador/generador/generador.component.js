var GeneradorCtrl = function (ReportesSvc, GeneradorSvc) {
    var vm = this;
    vm.isLoading = false;
    vm.filtros = {
        year : moment().format('YYYY') * 1,
        week: 2,
        content_id: '',
        content_name: ''
    };
    vm.yearList = [];
    vm.weekList = [];
    vm.getYearList = () => { for(let i = moment().format('YYYY') * 1; i  > 2005 ; i--) { vm.yearList.push(i); } };
    vm.getWeeksList = () => { for(let i = 1; i  < 53  ; i++) { vm.weekList.push({id: i, text: `Semana ${i}`}); }  };
    vm.getYearList();
    vm.getWeeksList();

    ReportesSvc.query((response)=> vm.reports = response.results.list);
    vm.selectContent = (content) => {
       vm.filtros.content_id = content.ID;
       vm.filtros.content_name = content.NAME;
       vm.generateGraphicsFromContent();
    };

    vm.graphics = [];
    vm.xAxis = [];
    vm.dataSeries = [];
    
    vm.generateGraphicsFromContent = () => {
        if (!vm.filtros.content_id) return false;
        if (!vm.filtros.week) return false;
        if (!vm.filtros.year) return false;

        vm.isLoading = true;
        GeneradorSvc.get(vm.filtros, (response) => {
            vm.graphics = response.results.graphics;
            vm.data = response.results.data;
            vm.isLoading = false;

            // Si no hay graficos , deberiamos imprmir la tabla
            
        });
    };

    //  vm.generateGraphicsFromContent();
}

angular.module('doc.features').component('generadorComponent', {
  template: require('./generador.component.html'),
  controller: ["ReportesSvc", 'GeneradorSvc', GeneradorCtrl],
  bindings: {}
});