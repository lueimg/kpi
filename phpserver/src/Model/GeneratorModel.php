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
        // $this->debug($data);
        // Execute Procedure
        $anio = $data->year;
        $semana= $data->week;
        $antiguedad = $content->WEEKSRANGE;
        $procedure =$content->PROCEDURE;
        $query = "BEGIN $procedure($semana, $anio, $antiguedad ); END;";
        $this->execQuery($query);

       // Get data from Temporal
        $seriesDataRaw = $this->getListFromTemporalTableGraphic();
        
        $data = [ 
            "graphics" => $content->graphs, 
            "data"=> $seriesDataRaw
        ];

        return [
            "status" => 200,
            "results" => $data
        ];

    }

    

}
