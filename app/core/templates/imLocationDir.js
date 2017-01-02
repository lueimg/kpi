import './imLocationDir.scss';

angular
  .module('doc.features')
  .directive('imLocation', function () {
    return {
      restrict: 'E',
      templateUrl: 'core/templates/imLocationDir.html',
      scope: {
        onChange: '&',
        initialCode: '@'
      },
      controller: ['$scope', 'Ubigeo',
      function ($scope, Ubigeo) {
        var vm = $scope;

        vm.locationData = {
          dpto: undefined,
          prov: undefined,
          dist: undefined
        };

        vm.ubigeoSelected = '';

        function getCode() {
          var result;

          if (vm.locationData.dpto) {
            result = vm.locationData.dpto < 10 ? '0' + vm.locationData.dpto.toString() : vm.locationData.dpto.toString();

            result += vm.locationData.prov ? (vm.locationData.prov < 10 ? '0' + vm.locationData.prov.toString() :
              vm.locationData.prov.toString()) : '00';

            result += vm.locationData.dist ? (vm.locationData.dist < 10 ? '0' + vm.locationData.dist.toString() :
              vm.locationData.dist.toString()) : '00';
          }

          return result;
        }

        Ubigeo.query({}, (response) => {
          vm.departamentos = response.results.list;
          if (vm.initialCode) {
            vm.locationData.dpto = (vm.initialCode.slice(0, 2)*1);//.toString();
            vm.locationData.prov = (vm.initialCode.slice(2, 4)*1);//.toString();
            vm.locationData.dist = (vm.initialCode.slice(4, 6)*1);//.toString();

            if (vm.locationData.dpto) {
              vm.provincias = Ubigeo.query({dpto: vm.locationData.dpto});
            }

            if (vm.locationData.prov) {
              vm.distritos = Ubigeo.query({
                dpto: vm.locationData.dpto,
                prov: vm.locationData.prov
              });
            }
          }
        });

        vm.showProvincias = () => {
          vm.locationData.prov = undefined;
          vm.locationData.dist = undefined;
          vm.provincias = Ubigeo.query(vm.locationData);
          vm.distritos = [];
          vm.ubigeoSelected = getCode();
          vm.onChange({data: getCode()});
        };

        vm.showDistritos = () => {
          vm.distritos = Ubigeo.query(vm.locationData);
          vm.ubigeoSelected = getCode();
          vm.onChange({data: getCode()});
        };

        vm.onSelectLocation = () => {
          vm.ubigeoSelected = getCode();
          vm.onChange({data: getCode()});

        };
      }]
    };
  });