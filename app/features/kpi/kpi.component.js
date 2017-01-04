var KpiComponentCtrl = function (notification) {
    var vm = this;

    vm.searchKey = '';
    vm.toDelete = {
        id: 0,
        nombre: '',
        clasificacion: ''
    };
    vm.colDef = [
        {
            columnHeaderDisplayName: 'id',
            displayProperty: 'idkpi',
            sortKey: 'id',
            width: '6em'
        },
        {
            columnHeaderDisplayName: 'Nombre',
            displayProperty: 'nombre',
            sortKey: 'nombre'
        },
        {
            columnHeaderDisplayName: 'Clasificación',
            displayProperty: 'clasificacion',
            sortKey: 'clasificacion'
        },
        {
            columnHeaderDisplayName: '',
            template: require('./templates/editColumn.html'),
            width: '1em'
        },
        {
            columnHeaderDisplayName: '',
            template: require('./templates/deleteColumn.html'),
            width: '1em'
        }
    ];

    vm.tableConfig = {
        url: 'Api/kpi',
        method: 'get',
        params:{
            reload: false
        },
        paginationConfig: {
        response: {
            totalItems: 'results.count',
            itemsLocation: 'results.list'
        }
        },
        state: {
        sortKey: 'idkpi',
        sortDirection: 'ASC'
        }
    };

    vm.confirmDelete = function (item) {
        vm.toDelete.id = item.idkpi;
        vm.toDelete.nombre = item.nombre;
        vm.toDelete.clasificacion = item.clasificacion;

        angular.element('#deleteModal').modal();
    };

    vm.deleteClient = function (idkpi) {
        Client.delete({idkpi: idkpi}, function () {
        vm.tableConfig.params.reload = !vm.tableConfig.params.reload;
        notification.great('Eliminado correctamente.');
        }, function (error) {
        var message = error.data && error.data.results && error.data.results.message ||
            'Error al eliminar.';
        notification.error(message);
        });
    };

    vm.search = function () {
        vm.tableConfig.params.nombre = vm.searchKey;
    };


}

angular.module('doc.features').component('kpiComponent', {
  template: require('./kpi.component.html'),
  controller: ['notification', KpiComponentCtrl],
  bindings: {}
});