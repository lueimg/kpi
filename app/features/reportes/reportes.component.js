var ReportesComponentCtrl = function (notification, ServicesConfig) {
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
            displayProperty: 'id',
            sortKey: 'id',
            width: '6em'
        },
        {
            columnHeaderDisplayName: 'Nombre',
            displayProperty: 'name',
            sortKey: 'name'
        },
        {
            columnHeaderDisplayName: 'Sub Reportes',
            template: '{{item.subreportes}}',
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
        url: ServicesConfig.url + '/reportes',
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
        sortKey: 'id',
        sortDirection: 'ASC'
        }
    };

    vm.confirmDelete = function (item) {
        vm.toDelete.id = item.id;
        vm.toDelete.nombre = item.nombre;

        angular.element('#deleteModal').modal();
    };

    vm.deleteClient = function (idreportes) {
        Client.delete({id: idreportes}, function () {
        vm.tableConfig.params.reload = !vm.tableConfig.params.reload;
        notification.great('Eliminado correctamente.');
        }, function (error) {
        var message = error.data && error.data.results && error.data.results.message ||
            'Error al eliminar.';
        notification.error(message);
        });
    };

    vm.search = function () {
        vm.tableConfig.params.name = vm.searchKey;
    };


}

angular.module('doc.features').component('reportesComponent', {
  template: require('./reportes.component.html'),
  controller: ['notification', 'ServicesConfig', ReportesComponentCtrl],
  bindings: {}
});