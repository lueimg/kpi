(function () {
  angular
  .module('doc.features')
  .directive('datePicker', function () {
    return {
      restrict : 'A',
      link : function (scope, element) {
        $(function () {
          // Define spanish texts
          $.fn.datepicker.dates.es = {
            days: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
            daysShort: ['Dom', 'Lum', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'],
            daysMin: ['D', 'L', 'M', 'M', 'J', 'V', 'S'],
            months: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
              'Julio', 'Agosto', 'Setiembre', 'Octubre', 'Noviembre', 'Diciembre'],
            monthsShort: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul',
              'Ago', 'Set', 'Oct', 'Nov', 'Dic'],
            today: 'Hoy',
            clear: 'Borrar',
            format: 'dd/mm/yyyy',
            titleFormat: 'MM yyyy', /* Leverages same syntax as 'format' */
            weekStart: 0
          };
          $(element).datepicker({
            language: 'es',
            autoclose: true,
            clearBtn: true,
            todayHighlight: true,
            format: 'dd/mm/yyyy',
            endDate: '+0d'
          });
        });
      }
    };
  })
  .directive('sidebarMenu', function () {
    return {
      restrict: 'E',
      template: require('./templates/sidebarMenu.html'),
      controller: ['$scope', '$location', function ($scope, $location) {
        var vm = $scope,
            currentPath = '#' + $location.path();
          vm.mainMenu = [
            {
              isAllowed: true,
              liClass: 'treeview',
              aLink: '#/reportes',
              aIcon: 'fa fa-cog',
              aText: 'Mantenimientos',
              isActive: false,
              subMenu: [
                {
                  isAllowed: true,
                  liClass: '',
                  aLink: '#/reportes',
                  aIcon: 'fa fa-circle-o',
                  aText: 'Reportes'
                },
                {
                  isAllowed: true,
                  liClass: '',
                  aLink: '#/contenidos',
                  aIcon: 'fa fa-circle-o',
                  aText: 'Contenidos'
                },
                {
                  isAllowed: true,
                  liClass: '',
                  aLink: '#/comentarios',
                  aIcon: 'fa fa-circle-o',
                  aText: 'Comentarios'
                }
              ]
            },
           
            {
              isAllowed: true,
              liClass: 'treeview',
              aLink: '#/generador',
              aIcon: 'fa fa-th',
              aText: 'Reportes',
              isActive: false,
              subMenu: [
                {
                  isAllowed: true,
                  liClass: '',
                  aLink: '#/generador',
                  aIcon: 'fa fa-circle-o',
                  aText: 'Gráficos'
                },
                {
                  isAllowed: true,
                  liClass: '',
                  aLink: '#/exportador',
                  aIcon: 'fa fa-circle-o',
                  aText: 'Exportador'
                }
              ]
            }
          ];

          // Select current path
          vm.mainMenu.some((menu) => {
            var isRouteActive = menu.subMenu.some((item) => {
              if (item.aLink == currentPath) {
                item.isActive = true;
                return true;
              }
            });
            if (isRouteActive) {
              menu.isActive = true;
              return true;
            }
          });
        
        vm.onClickSubMenu = (menu, item) => {
          menu.forEach((subItem) => {
            subItem.isActive = false;
          });
          // Update current menu
          item.isActive = true;
        };
      }]
    };
  })
  .directive('userPanel', function () {
    return {
      restrict: 'E',
      template: require('./templates/userPanel.html'),
      controller: ['$scope', function ($scope) {
        
      }]
    };
  })
  .directive('requiredField', [function () {
    return {
      priority: 1, // Low priority so that it applies after any other directives than may affect the content.
      link: function (scope, element, attrs) {
        // Check if the field is required
        attrs.$observe('requiredField', function () {
          if (!attrs.requiredField || scope.$eval(attrs.requiredField)) {
            if (element.find('span.required-field-marker').length == 0) {
              element.addClass('required-field');
              element.append('<span class="required-field-marker">*</span>');
            }
          } else {
            if (element.find('span.required-field-marker').length > 0) {
              element.removeClass('required-field');
              element.find('span.required-field-marker').remove();
            }
          }
        });
      }
    };
  }])
  .directive('capitalize', [function () {
    return {
      require: 'ngModel',
      link: function (scope, element, attrs, modelCtrl) {
        var capitalize = function (inputValue) {
          var capitalized;

          if (inputValue == undefined) {
            inputValue = '';
          }
          capitalized = inputValue.toUpperCase();
          if (capitalized !== inputValue) {
            modelCtrl.$setViewValue(capitalized);
            modelCtrl.$render();
          }
          return capitalized;
        };

        modelCtrl.$parsers.push(capitalize);
        capitalize(scope[attrs.ngModel]); // capitalize initial value
      }
    };
  }])
  .directive('autoFocus', [function () {
    return {
      link: function (scope, element, attrs) {
        angular.noop(scope);
        attrs.$observe('autoFocus', function (newValue) {
          if (newValue == 'false') {
            element[0].blur();
          } else {
            element[0].focus();
          }
        });
      },
      restrict: 'A'
    };
  }])
  .directive('enterPress', function () {
    return function (scope, element, attrs) {
      element.bind('keydown keypress', function (event) {
        if(event.which === 13) {
          scope.$apply(function (){
            scope.$eval(attrs.enterPress);
          });

          event.preventDefault();
        }
      });
    };
  })
  .directive('customValidation', function () {
    return {
      require: 'ngModel',
      link: function (scope, element, attrs, modelCtrl) {
        modelCtrl.$parsers.push(function (inputValue) {
          var transformedInput = inputValue.toLowerCase().replace(/ /g, '');

          if (transformedInput != inputValue) {
            modelCtrl.$setViewValue(transformedInput);
            modelCtrl.$render();
          }

          return transformedInput;
        });
      }
    };
  })
  .directive('multiTag', function () {
    return {
      restrict: 'E',
      template: require('./templates/multiTag.html'),
      scope: {
        selection: '=',
        placeholder: '@'
      },
      controller: ['$scope', function ($scope) {
        $scope.data = [];
        $scope.selection = $scope.selection || [];
        $scope.getTags = function (search) {
          var newTags = [];

          if (search) {
            newTags.push(search);
          }
          return newTags;
        };

        $scope.clearSelection = function (multiSelected) {
          $scope.selection.push(multiSelected.search);
          multiSelected.search = '';
        };

        $scope.removeTag = function (removed) {
          var index = $scope.selection.indexOf(removed);

          if ($scope.selection && index > -1) {
            $scope.selection.splice(index, 1);
          }
        };
      }]
    };
  })
  .directive('receptorCard', function () {
    return {
      restrict: 'E',
      template: require('./templates/receptorCard.html'),
      scope: {
        document: '=data'
      },
      controller: ['$scope', function ($scope) {
        angular.noop($scope);
      }]
    };
  })
  .directive('recepcionadoCard', function () {
    return {
      restrict: 'E',
      template: require('./templates/recepcionadoCard.html'),
      scope: {
        assignment: '=data'
      },
      controller: ['$scope', function ($scope) {
        angular.noop($scope);
      }]
    };
  })
  .directive('dischargeCard', function () {
    return {
      restrict: 'E',
      template: require('./templates/dischargeCard.html'),
      scope: {
        discharge: '=data'
      },
      controller: ['$scope', function ($scope) {
        angular.noop($scope);
      }]
    };
  })
  .directive('closedCard', function () {
    return {
      restrict: 'E',
      template: require('./templates/closedCard.html'),
      scope: {
        closed: '=data'
      },
      controller: ['$scope', function ($scope) {
        angular.noop($scope);
      }]
    };
  })
  .directive('hcChart', function () {
                return {
                    restrict: 'E',
                    template: '<div></div>',
                    scope: {
                        options: '='
                    },
                    link: function (scope, element) {
                        Highcharts.chart(element[0], scope.options);
                    }
                };
            })
  // Directive for pie charts, pass in title and data only    
  .directive('hcPieChart', function () {
      return {
          restrict: 'E',
          template: '<div></div>',
          scope: {
              title: '@',
              data: '='
          },
          link: function (scope, element) {
              Highcharts.chart(element[0], {
                  chart: {
                      type: 'pie'
                  },
                  title: {
                      text: scope.title
                  },
                  plotOptions: {
                      pie: {
                          allowPointSelect: true,
                          cursor: 'pointer',
                          dataLabels: {
                              enabled: true,
                              format: '<b>{point.name}</b>: {point.percentage:.1f} %'
                          }
                      }
                  },
                  series: [{
                      data: scope.data
                  }]
              });
          }
      };
  })
})();
