to create a new component 

function newCtrl(service) {
    var ctrl = this;
}

angular.module('doc.features').component('newComponent', {
  template: require('./template.component.html'),
  controller: ['service', newCtrl],
  bindings: {}
});