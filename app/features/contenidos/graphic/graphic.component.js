var GraphicCtrl = function () {
   var vm = this;

   vm.removeGraph = () => {
     vm.onRemoveGraphic();
   };

    vm.addSerie = () => vm.graphic.series.push({});
    vm.removeSerie = (index) => vm.graphic.series.splice(index, 1);
}

angular.module('doc.features').component('graphicFieldComponent', {
  template: require('./graphic.component.html'),
  controller: [ GraphicCtrl],
  bindings: {
    graphic: "=",
    onRemoveGraphic: "&"
  }
});