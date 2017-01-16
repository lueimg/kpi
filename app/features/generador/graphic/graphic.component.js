var Controller = function () {
    var vm = this;
    vm.isLoading = true;

    vm.getSerie = (serie) => {
      var data = _.filter(vm.data, [serie.COLUMNA, serie.NAME]);
     
      return {
        "name": serie.NAME,
        "id": serie.ID,
        data: _.map(data, (item) =>  item.VALOR * 1  ),
        type: serie.SUBGRAPHIC_TYPE
      };
    }

    vm.$onInit = () => {
      vm.series = [];
      vm.graphic.series.forEach((serie) => {
        vm.series.push(vm.getSerie(serie));
      });

      vm.xAxisData = [];
      vm.title = vm.graphic.title;
      vm.graphic_type = vm.graphic.graphic_type;

      // Data for graphic
      vm.chartConfig = {

      chart: {
        type: vm.graphic_type
      },
      plotOptions: {
        series: {
          stacking: '',
          cursor: 'pointer',
              events: {
                  click: function (event) {
                      console.log(this);
                      
                  }
              }
        }
      },
      series: vm.series,
      title: {
        text: vm.title
      },
      xAxis: {
        categories: _.map(vm.xaxis, (item) => `${item.substr(0, 4)} - ${item.substr(4, 2)}`)
      },
      yAxis: {
          title: {
              text: vm.graphic.und
          }
      },
    }
     vm.isLoading = false;
    }

}

angular.module('doc.features').component('graphicComponent', {
  template: require('./graphic.component.html'),
  controller: [Controller],
  bindings: {
      data: "<",
      graphic: "<",
      xaxis: "<"
  }
});