var GeneradorCtrl = function (notification, ContentSvc) {
    var vm = this;
    vm.filters = {
        year : "2016",
        week : "40",
        content_id: 0
    };
    vm.content = {};
    // Sample options for first chart
    vm.chartOptions = {
        title: {
            text: 'Temperature data'
        },
        xAxis: {
            categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        },

        series: [
            { data: [29.9, 71.5, 106.4, 129.2, 144.0, 176.0, 135.6, 148.5, 216.4, 194.1, 95.6, 54.4]}
        ]
    };

    // Sample data for pie chart
    vm.pieData = [{
            name: "Microsoft Internet Explorer",
            y: 56.33
        }, {
            name: "Chrome",
            y: 24.03,
            sliced: true,
            selected: true
        }, {
            name: "Firefox",
            y: 10.38
        }, {
            name: "Safari",
            y: 4.77
        }, {
            name: "Opera",
            y: 0.91
        }, {
            name: "Proprietary or Undetectable",
            y: 0.2
    }];

    vm.showContent = (content_id = 0)  => {
        vm.filters.content_id = content_id ? content_id :  vm.filters.content_id;
        ContentSvc.get({ID: 66}, (response) => {
            vm.content = response.results;
            console.log(vm.content);
        });
    }


     vm.showContent();
}

angular.module('doc.features').component('generadorComponent', {
  template: require('./generador.component.html'),
  controller: ['notification', 'ContentSvc', GeneradorCtrl],
  bindings: {}
});