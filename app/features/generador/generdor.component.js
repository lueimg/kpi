var GeneradorCtrl = function (ReportesSvc) {
    var vm = this;
    vm.filtros = {
        year : moment().format('YYYY') * 1
    };

    vm.yearList = [];
    vm.getYearList = () => {
        let lastYear = moment().format('YYYY') * 1 ;
        for(let i = lastYear; i  > 1980 ; i--) {
            vm.yearList.push(i);
        }
    };

    vm.weekList = [];
    vm.getWeeksList = () => {
        for(let i = 1; i  < 53  ; i++) {
            vm.weekList.push({id: i, text: `Semana ${i}`});
        }
    };

     vm.getYearList();
     vm.getWeeksList();


     ReportesSvc.query((response)=> vm.reports = response.results.list);

     vm.selectContent = (content_id) => {

     };

}

angular.module('doc.features').component('generadorComponent', {
  template: require('./generador.component.html'),
  controller: ["ReportesSvc", GeneradorCtrl],
  bindings: {}
});