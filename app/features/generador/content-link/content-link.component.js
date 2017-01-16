var Controller = function () {
    var vm = this;
    vm.selectContent = (content) => {
        vm.onClick({content: content});
    };
}

angular.module('doc.features').component('contentsLinkComponent', {
  template: require('./content-link.component.html'),
  controller: [ Controller],
  bindings: {
      contents: "<",
      onClick: "&"
      
  }
});