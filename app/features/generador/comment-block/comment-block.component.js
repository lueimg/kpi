var Controller = function (CommentSvc) {
    var vm = this;
    vm.list = [];
    vm.comment = {
        user: '',
        comment: ''
    };
    
    vm.$onInit = () => {
         vm.getCommentList();
    };
    vm.$onChanges = (data) => {
        vm.getCommentList();
    }

    vm.showCommentForm = function () {
        vm.comment =  {
            user: '',
            comment: ''
        };
        console.log(`#addComment-key-${vm.key}`);
        angular.element(`#addComment-key-${vm.key}`).modal();
    };

    vm.saveComment = () => {
        if (!vm.comment.user) return false;
        if (!vm.comment.comment) return false;
        
        vm.comment.key = vm.key;
        if (vm.comment.id) {
            CommentSvc.update(vm.comment, (reponse) => {
                vm.comment = { user: '', comment: '' };
                vm.getCommentList();
            });
        } else {
            CommentSvc.save(vm.comment, (response ) => {
                vm.comment = { user: '', comment: '' };
                vm.getCommentList();
            });
        }
        
    }

    vm.deleteComment = () => {
        if (vm.comment.id) {
            CommentSvc.delete(vm.comment, (reponse) => {
                vm.comment = { user: '', comment: '' };
                vm.getCommentList();
            });
        }
    }

    vm.editComment = (comment) => {
        vm.comment.id = comment.ID;
        vm.comment.user = comment.USUARIO;
        vm.comment.comment = comment.COMENTARIO;
        // console.log(vm.comment);
        angular.element(`#addComment-key-${vm.key}`).modal();
    }
    vm.getCommentList = () => {
        if (!vm.key) return false;
        
        CommentSvc.query({key: vm.key}, (response) => {
            vm.list = response.results.list;
        });
    }
}

angular.module('doc.features').component('commentBlockComponent', {
  template: require('./comment-block.component.html'),
  controller: ['CommentSvc', Controller],
  bindings: {
      key: "<",
      title: "@"
  }
});