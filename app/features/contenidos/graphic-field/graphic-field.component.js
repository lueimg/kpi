var GraphicCtrl = function () {
   var vm = this;

   vm.removeGraph = () => {
     vm.onRemoveGraphic();
   };

    vm.addSerie = () => vm.graphic.series.push({});
    vm.removeSerie = (index) => vm.graphic.series.splice(index, 1);

    vm.updateSubGraphicType = () => {
      switch(vm.graphic.graphic_type) {
        case 'pie':
          vm.graphic.series.forEach((serie) => serie.SUBGRAPHIC_TYPE = '');
          vm.subGraphicDisabled = true;
          vm.graphic.yAxises = [];
          break;
        default:
          vm.subGraphicDisabled = false;
      }
    }
    vm.addYAxis = () => {
       vm.graphic.yAxises.push({});
    }

    vm.removeYAxis = (index) => {
        vm.graphic.yAxises.splice(index, 1);
    }



}

angular.module('doc.features').component('graphicFieldComponent', {
  template: require('./graphic-field.component.html'),
  controller: [ GraphicCtrl],
  bindings: {
    graphic: "=",
    onRemoveGraphic: "&"
  }
});