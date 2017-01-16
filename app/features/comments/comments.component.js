var Controller = function (CommentSvc, ServicesConfig) {
    var vm = this;
     vm.searchKey = '';
    vm.toDelete = {
        ID: 0,
        USUARIO: '',
        COMENTARIO: ''
    };
    vm.colDef = [
        {
            columnHeaderDisplayName: 'id',
            displayProperty: 'ID',
            sortKey: 'ID'
        },
        {
            columnHeaderDisplayName: 'Usuario',
            displayProperty: 'USUARIO',
            sortKey: 'USUARIO'
        },
        {
            columnHeaderDisplayName: 'Comentario',
            template: '{{item.COMENTARIO}}',
            sortKey: 'COMENTARIO'
        },
        {
            columnHeaderDisplayName: 'Fecha',
            template: '{{item.CREATED_AT}}',
             sortKey: 'CREATED_AT'
           
        },
        {
            columnHeaderDisplayName: '',
            template: require('./templates/deleteColumn.html'),
            width: '1em'
        }
    ];

    vm.tableConfig = {
        url: ServicesConfig.url + '/Comments',
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
        sortDirection: 'DESC'
        }
    };

    vm.confirmDelete = function (item) {
        vm.toDelete.ID = item.ID;
        vm.toDelete.USUARIO = item.USUARIO;
        vm.toDelete.COMENTARIO = item.COMENTARIO;
        angular.element('#deleteModal').modal();
    };

    vm.delete = function (id) {
        CommentSvc.delete({ID: id}, function () {
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

angular.module('doc.features').component('commentsComponent', {
  template: require('./comments.component.html'),
  controller: ['CommentSvc', 'ServicesConfig', Controller],
  bindings: {}
});