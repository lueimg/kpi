var Controller = function ($scope) {
    var vm = this;
    vm.isLoading = true;

   
    vm.$onInit = () => {
      // console.log("grapfic", vm.graphic);
      vm.xAxisData = [];
      vm.title = vm.graphic.title;
      vm.mainGrapicType = (vm.graphic.kpis[0].GRAPHIC_TYPE == 'pie')? 'pie' : 'line';

      // Data for graphic
      vm.chartConfig = {
        chart: {
          type: vm.mainGrapicType
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
                      switch(vm.mainGrapicType) {
                        case 'area':
                        case 'line': 
                          var pointValue = _.filter(this.points, ["state", "hover"])[0].y;
                          var title = `${this.userOptions.name}: (${pointValue}) `;
                          var key = `${this.userOptions.id}${_.filter(this.points, ["state", "hover"])[0].category.split(' - ').join('').trim()}`;
                          break;
                        case 'pie':
                        
                          var point = _.filter(this.points, ["state", "hover"])[0];
                          // console.log(point);
                          var title = `${point.name}: (${point.y}) `;
                          var key = `${point.id}${vm.rangeOfWeekYear}`;
                          break;

                      }
                      // console.log(title);
                      // console.log(key);
                      vm.onPointClick(key, title);
                      $scope.$apply()
                    }
                }
          }
        },
        series: [],
      };

      switch(vm.mainGrapicType) {
        case 'area':
        case 'line': 
        //  console.log("data", vm.data);
          vm.chartConfig.xAxis = {
            categories: _.map(vm.data, (item) => item.REFFECHA)
          };

          vm.chartConfig.yAxis = vm.graphic.kpis.map((kpi, index) => {
            return {
              title: {
                text: kpi.TITLE
            },
            labels: {
                format: '{value} ' + kpi.SUFFIX ,
                style: {
                    color: Highcharts.getOptions().colors[index]
                }
            },
            opposite: kpi.OPPOSITE > 0
            }
          });

          // Series
          var elementos = [];
          var elementosData = {}; 
          vm.data.forEach((item) => { 
            if(!elementosData[item.ELEMENTO]) elementosData[item.ELEMENTO] = []; 

            elementosData[item.ELEMENTO].push(item)  
          });
          elementos = Object.keys(elementosData);

          vm.graphic.kpis.forEach((kpi) => {
            var campo = kpi.NAME_FROM_PROCEDURE;
            // Get series
            elementos.forEach((el) => {
              vm.chartConfig.series.push({
                name: el,
                unidad: kpi.TITLE,
                suffix: kpi.SUFFIX,
                id: kpi.ID,
                type: kpi.GRAPHIC_TYPE,
                yAxis: (+kpi.YAXIS_GROUP -1),
                tooltip: {
                    valueSuffix: ' ' + kpi.SUFFIX
                },
                data: elementosData[el].map((item) => item[kpi.NAME_FROM_PROCEDURE]*1)
              })
            })
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
                    format: '{point.name}: {point.percentage:.1f} %'
                }
            };

            vm.chartConfig.tooltip = {
                  pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
              };
            // Series 
            // console.log('data', vm.data);
            vm.chartConfig.series = [
              {
                name: vm.graphic.title,
                colorByPoint: true,
                data: vm.data.map((row) => {
                    
                  return {
                    name: row.ELEMENTO,
                    id: row.ORDEN,
                    y: row.VALOR1*1
                  }
                })
              }
            ];
    
          break;

      }
      vm.isLoading = false;
      // console.log('chart config',  vm.chartConfig);
    } // fin init

    

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