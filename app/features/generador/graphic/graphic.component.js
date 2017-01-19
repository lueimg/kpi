var Controller = function ($scope) {
    var vm = this;
    vm.isLoading = true;

    vm.getSerie = (serie) => {
      var data = _.filter(vm.data, [serie.COLUMNA, serie.NAME]);
      
      return {
        "name": serie.NAME,
        "id": serie.ID,
        data: _.map(data, (item) =>  item.VALOR * 1  ),
        type: serie.SUBGRAPHIC_TYPE,
        unidad: serie.UNIDAD
      };
    }

    vm.$onInit = () => {
      vm.xAxisData = [];
      vm.title = vm.graphic.title;
      vm.graphic_type = vm.graphic.graphic_type;

      // Data for graphic
      vm.chartConfig = {
      chart: {
        type: vm.graphic.graphic_type
      },
      title: {
        text: vm.graphic.title
      },
      plotOptions: {
        series: {
          stacking: '',
          cursor: 'pointer',
              events: {
                  click: function (event) {
                    switch(vm.graphic.graphic_type) {
                      case 'area':
                      case 'line': 
                        var pointValue = _.filter(this.points, ["state", "hover"])[0].y;
                        var title = `${this.userOptions.name}: (${pointValue}) `;
                        var key = `${this.userOptions.id}${_.filter(this.points, ["state", "hover"])[0].category.split(' - ').join('').trim()}`;
                        break;
                      case 'pie':
                       
                        var point = _.filter(this.points, ["state", "hover"])[0];
                        console.log(point);
                        var title = `${point.name}: (${point.y}) `;
                        var key = `${point.id}${vm.rangeOfWeekYear}`;
                        break;

                    }
                    

                    console.log(title);
                    console.log(key);
                    vm.onPointClick(key, title);
                    $scope.$apply()
                  }
              }
        }
      },
      series: [],
      };

      switch(vm.graphic.graphic_type) {
        case 'area':
        case 'line': 
          vm.chartConfig.xAxis = {
            categories: _.map(vm.data, (item) => item.REFFECHA)
          };

          vm.chartConfig.yAxis = {
            title: {
                text: vm.graphic.und
            }
          };
          // Series 
          vm.chartConfig.series = vm.graphic.series.map((serie) => {
            return {
              name: serie.SERIE_NAME,
              unidad: serie.UNIDAD,
              id: serie.ID,
              type: serie.SUBGRAPHIC_TYPE,
              data: _.filter(vm.data, ['ELEMENTO', serie.NAME_FROM_PROCEDURE]).map((item) => item.VALOR1*1)
            }
          });
          let xAxisPoints = vm.chartConfig.xAxis.categories.length = vm.chartConfig.series[0].data.length;
          break;
        case 'pie':
          vm.rangeOfWeekYearArray = vm.data[vm.data.length -1].REFFECHA.split('-')
          vm.rangeOfWeekYear = `${vm.rangeOfWeekYearArray[1]}${vm.rangeOfWeekYearArray[0]}`;
          vm.chartConfig.plotOptions.pie = {
              allowPointSelect: true,
              cursor: 'pointer'  
            };
            // Series 
            vm.chartConfig.series = [
              {
                name: vm.graphic.title,
                colorByPoint: true,
                data: vm.graphic.series.map((serie) => {
                  return {
                    name: serie.SERIE_NAME,
                    id: serie.ID,
                    y: _.filter(vm.data, ['ELEMENTO', serie.NAME_FROM_PROCEDURE]).map((item) => item.VALOR1*1)[0]
                  }
                })
              }
            ];
    
          break;

      }

      // If there is multiples Unids 
      let multipleAxis = Object.keys(_.groupBy(vm.graphic.series, 'UNIDAD'));
      if (multipleAxis.length > 1) {
        vm.chartConfig.chart = {
            zoomType: 'xy'
        };

        vm.chartConfig.xAxis.crosshair = true;
        vm.chartConfig.xAxis = [vm.chartConfig.xAxis];

        vm.chartConfig.yAxis = multipleAxis.map((yaxis) => {
          return {title: {text: yaxis}, opposite: true};
        })
        vm.chartConfig.yAxis[0].opposite = false;

        vm.chartConfig.series.forEach((serie) => {
          serie.yAxis = multipleAxis.indexOf(serie.unidad);
        })


      }
      

      console.log(vm.chartConfig);
      vm.isLoading = false;
    }

    vm.currentPoint = '';
    vm.onPointClick = (key, title) => {
      vm.currentPoint = key;
      vm.pointTitle = title;
    };

}

angular.module('doc.features').component('graphicComponent', {
  template: require('./graphic.component.html'),
  controller: ['$scope', Controller],
  bindings: {
      data: "<",
      graphic: "<"
  }
});