var Controller = function () {
    var vm = this;
}

angular.module('doc.features').component('contentsLinkComponent', {
  template: require('./content-link.component.html'),
  controller: [ Controller],
  bindings: {
      contents: "<",
      onClic: "&"
      
  }
});