<?php

namespace App\Model;

use App\Model\ReportsModel;
use App\Model\ContentModel;

class GeneratorModel extends Model
{
    
    protected $newId =  '';
    protected $currentId = '';
    protected $seq = '';
    protected $table= '';
    protected $reportsModel;
   
    function __construct()
    {
        parent::__construct();

        $this->seq = $this->tables->content->seq;
        $this->table = $this->tables->content->name;

        $this->newId = $this->seq . '.nextval';
        $this->currentId = $this->seq.'.currval';
        

        $this->reportsModel = new ReportsModel();
        $this->contentModel = new ContentModel();

    }

    public function reportsMenu($data = [])
    {   
        $data = [];
        $list = $this->reportsModel->fetchAll()["results"]['list'];
        
        foreach($list as $report) {

            $query = "SELECT * FROM KPI_CONTENTS WHERE SUBREPORT_ID IS NULL AND REPORT_ID = $report->ID AND STATUS = 1";
            $contents = $this->getList($query);

            $newSubReports = [];
            foreach($report->SUBREPORTS_ROWS as $subreport) {
                $sub = $subreport;
                $query = "SELECT * FROM KPI_CONTENTS WHERE SUBREPORT_ID = $sub[ID] AND STATUS = 1";
                $subreport["contents"] = $this->getList($query);
                $newSubReports[] = $subreport;
            }

            $data[] = array(
                    "name" => $report->NAME,
                    "contents"=> $contents, 
                    'subreports'=> $newSubReports
                );
        }

        return [
            "status" => 200,
            "results" => [
                "list" => $data
            ]
        ];
    }

    public function generateContentForGraphics($data = []) {
        
        $content = $this->contentModel->fetchById($data->content_id)['results'];
        // return $content;
        // Execute Procedure
        $query = "EXECUTE $content->PROCEDURE()";
        // $this->execQuery($query);

        $from = " FROM KPI_RESUMEN  ";
        $where = "";
        $order = " ORDER BY KEY ASC ";
        
        $endQuery = "$from $where $order";
        // Y axis Data
        $queryXAxis = "SELECT DISTINCT  ANIO||LPAD(SEMANA, 2, '0') KEY $endQuery";
        $YAxis = $this->getList($queryXAxis);
        $XAxisData = [];
        foreach($YAxis as $row) {
            $XAxisData[] = $row->KEY;
        }

        // Data Per serie
        $queryData = "SELECT  ANIO||LPAD(SEMANA, 2, '0') KEY , ANIO , SEMANA , TO_CHAR(VALOR, '0.99999')* 100 VALOR, UGW_NAME, KPI $endQuery";
        $seriesDataRaw = $this->getList($queryData);

        $data = [ "graphics" => $content->graphs, "xAxis" => $XAxisData, "dataSeries"=> $seriesDataRaw];

        return [
            "status" => 200,
            "results" => $data
        ];

    }

}
