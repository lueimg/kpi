var Controller = function () {
    var vm = this;

   
}

angular.module('doc.features').component('graphicComponent', {
  template: require('./graphic.component.html'),
  controller: [Controller],
  bindings: {
      data: "<",
      onClick: "&"
  }
});