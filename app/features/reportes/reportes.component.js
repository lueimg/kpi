var ReportesComponentCtrl = function (notification, ServicesConfig, ReportesSvc) {
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
            displayProperty: 'ID',
            sortKey: 'ID',
            width: '6em'
        },
        {
            columnHeaderDisplayName: 'Nombre',
            displayProperty: 'NAME',
            sortKey: 'NAME'
        },
        {
            columnHeaderDisplayName: 'Sub Reportes',
            template: '{{item.SUBREPORTS_TOTAL  || 0}}'
            
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
        url: ServicesConfig.url + '/reports',
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
        vm.toDelete.ID = item.ID;
        vm.toDelete.NAME = item.NAME;

        angular.element('#deleteModal').modal();
    };

    vm.delete = function (id) {
        console.log(id);
        ReportesSvc.delete({ID: id}, function () {
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
  controller: ['notification', 'ServicesConfig', 'ReportesSvc', ReportesComponentCtrl],
  bindings: {}
});