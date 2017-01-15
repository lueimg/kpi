<?php

namespace App\Model;

use App\Model\ReportsModel;

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

    }

    public function fetchAll($data = [])
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

    

    
}
