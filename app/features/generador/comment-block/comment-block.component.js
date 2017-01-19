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
        console.log(`#addComment-key-${vm.key}`);
        angular.element(`#addComment-key-${vm.key}`).modal();
    };

    vm.saveComment = () => {
        if (!vm.comment.user) return false;
        if (!vm.comment.comment) return false;
        
        vm.comment.key = vm.key;
        CommentSvc.save(vm.comment, (response ) => {
            vm.comment = { user: '', comment: '' };
            vm.getCommentList();
        });
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