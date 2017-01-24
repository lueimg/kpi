var Controller = function (GeneradorSvc, $scope) {
    var vm = this;
    vm.isLoading = false;
    vm.filtros = {
        year : moment().format('YYYY') * 1,
        week: 1,
    };
    vm.graphics = [];
    vm.reports = [];
    vm.disallowExport = false;

    vm.yearList = [];
    vm.weekList = [];
    vm.getYearList = () => { for(let i = moment().format('YYYY') * 1; i  > 2005 ; i--) { vm.yearList.push(i); } };
    vm.getWeeksList = () => { for(let i = 1; i  < 53  ; i++) { vm.weekList.push({id: i, text: `Semana ${i}`}); }  };
    vm.getYearList();
    vm.getWeeksList();

    vm.exportContent = () => {
        vm.graphics = [];
        vm.disallowExport = true;
        GeneradorSvc.getAllContent(vm.filtros, (response) => {
            vm.graphics = response.results.graphics;
            vm.reports = response.results.list;
            setTimeout(() => {
                vm.generatePdf(vm.reports);
            }, 1000);
        });
    };

    vm.addReportTitle = (doc, text) => {
        doc.setFontSize(13);
        doc.text(20, vm.yPosition, text.toUpperCase());
        vm.yPosition+=10;
    }

    vm.addSubReportTitle = (doc, text) => {
        doc.setFontSize(12);
        doc.text(25, vm.yPosition, text);
        vm.yPosition+=10;
    }

    vm.addContentTitle = (doc, text) => {
        doc.setFontSize(11);
        doc.text(30, vm.yPosition, text);
        vm.yPosition+=10;
    }

    vm.addGraphicTitle = (doc, text) => {
        doc.setFontSize(10);
        doc.text(35, vm.yPosition, text.toUpperCase());
        vm.yPosition+=10;
    }

    vm.addTable = (doc, rows) => {
        doc.autoTable(vm.columns, rows, {startY: vm.yPosition, pageBreak: 'avoid'});
        vm.yPosition = doc.autoTable.previous.finalY + 15;
        vm.yPosition = 20;
        doc.addPage();
    };

    vm.addGraphic = (doc, graphiId) => {
        var index = angular.element("#ID-" + graphiId).attr('data-highcharts-chart')
        var imageData = Highcharts.charts[index].createCanvas();
        doc.addImage(imageData, 'JPEG', 23, vm.yPosition, 150, 100);
        vm.yPosition+=(100 + 10);
    }

    vm.addContentSection = (doc, contents) => {
        contents.forEach((content) => {
            vm.addContentTitle(doc, content.NAME);
            content.graphics.forEach((graphic) => {
                // vm.addGraphicTitle(doc, graphic.title);
                // add graphic
                vm.addGraphic(doc, graphic.id);
                // add comments table
                var idx = 1;
                vm.addTable(doc, graphic.comments.map((comment) => [ idx++, comment.USUARIO, comment.COMENTARIO ] ));
            })
        })
    }

    vm.generatePdf = (reports) => {
        var doc = new jsPDF();
        
        var chartHeight = 80;
        vm.yPosition = 20;
        vm.columns = ["ID", "Usuario", "Comentario"];
        var rows = [];
        
        reports.forEach((report) => {
            if (report.contents.length || report.subreports.length ) vm.addReportTitle(doc, report.name);
            vm.addContentSection(doc, report.contents);
            report.subreports.forEach((subreport) => {
                if (subreport.contents.length) vm.addSubReportTitle(doc, subreport.NAME);
                vm.addContentSection(doc, subreport.contents);
            });
        })
        
        //save with name
        var time = new Date().getTime();
        
        doc.save(`${vm.filtros.year}.${vm.filtros.week}.${time}.pdf`);
        vm.disallowExport = false;
        $scope.$apply();
    };

    (function (H) {
        H.Chart.prototype.createCanvas = function (divId) {
            var svg = this.getSVG(),
                width = parseInt(svg.match(/width="([0-9]+)"/)[1]),
                height = parseInt(svg.match(/height="([0-9]+)"/)[1]),
                canvas = document.createElement('canvas');

            canvas.setAttribute('width', width);
            canvas.setAttribute('height', height);

            if (canvas.getContext && canvas.getContext('2d')) {

                canvg(canvas, svg);

                return canvas.toDataURL("image/jpeg");

            } 
            else {
                alert("Your browser doesn't support this feature, please use a modern browser");
                return false;
            }

        }
    }(Highcharts));

    
}

angular.module('doc.features').component('exportadorComponent', {
  template: require('./exportador.component.html'),
  controller: ['GeneradorSvc', '$scope', Controller],
  bindings: {}
});