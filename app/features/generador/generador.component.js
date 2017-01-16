var GeneradorCtrl = function (ReportesSvc, GeneradorSvc) {
    var vm = this;
    vm.isLoading = false;
    vm.filtros = {
        year : moment().format('YYYY') * 1,
        week: '',
        content_id: ''
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
    vm.selectContent = (content) => {
       vm.filtros.content_id = content.ID;
       vm.generateContent();
    };

    vm.graphics = [];
    vm.xAxis = [];
    vm.dataSeries = [];
    
    vm.generateContent = () => {
        if (!vm.filtros.content_id) return false;
        if (!vm.filtros.week) return false;
        if (!vm.filtros.year) return false;

        
        vm.isLoading = true;
        GeneradorSvc.get(vm.filtros, (response) => {
            vm.graphics = response.results.graphics;
            vm.xAxis = response.results.xAxis;
            vm.dataSeries = response.results.dataSeries;
        });

    };

    vm.clickOnPoint = (key) => {
        console.log(key);
    }

    //  vm.generateContent();
}

angular.module('doc.features').component('generadorComponent', {
  template: require('./generador.component.html'),
  controller: ["ReportesSvc", 'GeneradorSvc', GeneradorCtrl],
  bindings: {}
});