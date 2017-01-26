var Controller = function ($scope) {
    var vm = this;
    vm.isLoading = true;

   
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

          vm.chartConfig.yAxis = vm.graphic.yAxises.map((yaxis, index) => {
            return {
              title: {
                text: yaxis.TITLE
            },
            labels: {
                format: '{value} ' + yaxis.SUFFIX ,
                style: {
                    color: Highcharts.getOptions().colors[index]
                }
            },
            opposite: yaxis.OPPOSITE > 0
            }
          });

          // Series 
          vm.chartConfig.series = vm.graphic.series.map((serie) => {
            var elemento = serie.NAME_FROM_PROCEDURE.split('-')[0];
            var campo = serie.NAME_FROM_PROCEDURE.split('-')[1];
            var suffix = vm.graphic.yAxises.find((yaxis) => yaxis.ORDEN == serie.YAXIS).SUFFIX
            return {
              name: serie.SERIE_NAME,
              unidad: serie.LABELY,
              suffix: serie.SUFFIX,
              id: serie.ID,
              type: serie.SUBGRAPHIC_TYPE,
              yAxis: +serie.YAXIS,
              tooltip: {
                  valueSuffix: ' ' + suffix
              },
              data: _.filter(vm.data, ['ELEMENTO', elemento]).map((item) => item[campo]*1)
            }
          });
          let xAxisPoints = vm.chartConfig.xAxis.categories.length = vm.chartConfig.series[0].data.length;
          break;
        case 'pie':
          vm.rangeOfWeekYearArray = vm.data[vm.data.length -1].REFFECHA.split('-')
          vm.rangeOfWeekYear = `${vm.rangeOfWeekYearArray[1]}${vm.rangeOfWeekYearArray[0]}`;
          vm.chartConfig.plotOptions.pie = {
              allowPointSelect: true,
              cursor: 'pointer',
              dataLabels: {
                    enabled: true,
                    format: '<b>{point.name}</b>: {point.percentage:.1f} %',
                    style: {
                        color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
                    }
                }
            };

            vm.chartConfig.tooltip = {
                  pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
              };
            // Series 
            vm.chartConfig.series = [
              {
                name: vm.graphic.title,
                colorByPoint: true,
                data: vm.graphic.series.map((serie) => {
                    var elemento = serie.NAME_FROM_PROCEDURE.split('-')[0];
                    var campo = serie.NAME_FROM_PROCEDURE.split('-')[1];
                  return {
                    name: serie.SERIE_NAME,
                    id: serie.ID,
                    y: _.filter(vm.data, ['ELEMENTO', elemento]).map((item) => item[campo]*1)[0]
                  }
                })
              }
            ];
    
          break;

      }
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
      graphic: "<",
      hideComments: '<',
      charId: '@'
  }
});