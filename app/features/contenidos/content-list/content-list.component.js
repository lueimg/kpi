var ContentListCtrl = function (notification, ServicesConfig, ContentSvc) {
    var vm = this;

    vm.searchKey = '';
    vm.toDelete = {
        ID: 0,
        NAME: ''
    };
    vm.colDef = [
        {
            columnHeaderDisplayName: 'ID',
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
            columnHeaderDisplayName: 'Reporte',
            template: '{{item.REPORT_NAME}}',
            sortKey: 'REPORT_ID'
        },
        {
            columnHeaderDisplayName: 'Sub Reporte',
            template: '{{item.SUBREPORT_NAME}}',
        },
        {
            columnHeaderDisplayName: 'GRAFICOS',
            template: '{{item.GRAPHICS_TOTAL}}',
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
        url: ServicesConfig.url + '/Content',
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
        sortKey: 'ID',
        sortDirection: 'ASC'
        }
    };

    vm.confirmDelete = function (item) {
        vm.toDelete.ID = item.ID;
        vm.toDelete.NAME = item.NAME;

        angular.element('#deleteModal').modal();
    };

    vm.delete = function (content_id) {
        
        ContentSvc.delete({ID: content_id}, 
        function () {
            vm.tableConfig.params.reload = !vm.tableConfig.params.reload;
            notification.great('Eliminado correctamente.');
        }, function (error) {
            var message = error.data && error.data.results && error.data.results.message || 'Error al eliminar.';
            notification.error(message);
        });
    };

    vm.search = function () {
        vm.tableConfig.params.name = vm.searchKey;
    };

}

angular.module('doc.features').component('contentListComponent', {
  template: require('./content-list.component.html'),
  controller: ['notification', 'ServicesConfig', 'ContentSvc', ContentListCtrl],
  bindings: {}
});