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
        vm.isLoading = true;
        GeneradorSvc.getAllContent(vm.filtros, (response) => {
            vm.graphics = response.results.graphics;
            vm.reports = response.results.list;
            setTimeout(() => {
                vm.generatePdf(vm.reports);
            }, 1000);
        });
    };

    vm.addReportTitle = (text) => {
        
        vm.doc.setFontSize(10);
        vm.doc.text(150, vm.yPosition, `Año: ${vm.filtros.year} - Semana: ${vm.filtros.week}`);

        vm.doc.setFontSize(13);
        vm.doc.text(20, vm.yPosition,  '» ' + text.toUpperCase());
        vm.yPosition+=10;
    }

    vm.addSubReportTitle = (text) => {
        vm.doc.setFontSize(12);
        vm.doc.text(25, vm.yPosition, '» ' + text.toUpperCase());
        vm.yPosition+=10;
    }

    vm.addContentTitle = (text) => {
        vm.doc.setFontSize(11);
        vm.doc.text(30, vm.yPosition, '» ' + text.toUpperCase());
        vm.yPosition+=10;
    }

    vm.addGraphicTitle = (text) => {
        vm.doc.setFontSize(10);
        vm.doc.text(35, vm.yPosition, text.toUpperCase());
        vm.yPosition+=10;
    }

    vm.addTable = (rows) => {
        vm.doc.autoTable(vm.columns, rows, {startY: vm.yPosition, pageBreak: 'avoid'});
        vm.yPosition = vm.doc.autoTable.previous.finalY + 15;
        vm.yPosition = 20;
        vm.doc.addPage();
    };

    vm.addGraphic = (graphiId) => {
        var index = angular.element("#ID-" + graphiId).attr('data-highcharts-chart')
        var imageData = Highcharts.charts[index].createCanvas();
        vm.doc.addImage(imageData, 'JPEG', 23, vm.yPosition, 150, 100);
        vm.yPosition+=(100 + 10);
    }

    vm.addContentSection = (contents, reportName, subReportName) => {
        if (contents.length < 1) return false;

        if (reportName) vm.addReportTitle(reportName);

        if (subReportName) vm.addSubReportTitle(subReportName);

        contents.forEach((content) => {
            vm.addContentTitle(content.NAME);
            content.graphics.forEach((graphic) => {
                // vm.addGraphicTitle(doc, graphic.title);
                // add graphic
                vm.addGraphic(graphic.id);
                // add comments table
                var idx = 1;
                vm.addTable(graphic.comments.map((comment) => [  `» ${comment.COMENTARIO}` ] ));
            })
        })
    }

    vm.doc = {};

    vm.generatePdf = (reports) => {
        vm.doc = new jsPDF();
        
        var chartHeight = 80;
        vm.yPosition = 20;
        vm.columns = ["Comentarios"];
        var rows = [];
        
        reports.forEach((report) => {
            // if (report.contents.length || report.subreports.length ) 
                // vm.addReportTitle(report.name);

            vm.addContentSection(report.contents, report.name, undefined);
            report.subreports.forEach((subreport) => {
                // if (subreport.contents.length) vm.addSubReportTitle(subreport.NAME);
                vm.addContentSection(subreport.contents, report.name, subreport.NAME);
            });
        })
        
        //save with name
        var time = new Date().getTime();
        
        vm.doc.save(`${vm.filtros.year}.${vm.filtros.week}.${time}.pdf`);
        vm.disallowExport = false;
        vm.isLoading = false;
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