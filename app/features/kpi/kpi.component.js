function KpiComponentCtrl(notification) {
    var ctrl = this;

    ctrl.searchKey = '';
    ctrl.toDelete = {
        id: 0,
        nombre: '',
        clasificacion: ''
    };
    ctrl.colDef = [
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

    ctrl.tableConfig = {
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

    ctrl.confirmDelete = function (item) {
        ctrl.toDelete.id = item.idkpi;
        ctrl.toDelete.nombre = item.nombre;
        ctrl.toDelete.clasificacion = item.clasificacion;

        angular.element('#deleteModal').modal();
    };

    ctrl.deleteClient = function (idkpi) {
        Client.delete({idkpi: idkpi}, function () {
        ctrl.tableConfig.params.reload = !ctrl.tableConfig.params.reload;
        notification.great('Eliminado correctamente.');
        }, function (error) {
        var message = error.data && error.data.results && error.data.results.message ||
            'Error al eliminar.';
        notification.error(message);
        });
    };

    ctrl.search = function () {
        ctrl.tableConfig.params.nombre = ctrl.searchKey;
    };


}

angular.module('doc.features').component('kpiComponent', {
  template: require('./kpi.component.html'),
  controller: ['notification', KpiComponentCtrl],
  bindings: {}
});