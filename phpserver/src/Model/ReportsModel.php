<?php

namespace App\Model;

class ReportsModel extends Model
{
    
    protected $newId =  '';
    protected $currentId = '';
    protected $seq = '';
    protected $table= '';
   
    function __construct()
    {
        parent::__construct();

        $this->seq = $this->tables->reports->seq;

        $this->newId = $this->seq . '.nextval';
        $this->currentId = $this->seq.'.currval';
        $this->table = $this->tables->reports->name;
    }

    public function fetchAll($data = [])
    {  
       
        $table = $this->tables->reports->name;
        $subtable = $this->tables->subreports->name;
        $qFields = "SELECT RE.ID, RE.NAME, TOTALS.TOTAL SUBREPORTS_TOTAL, TOTALS.SUBREPORTS_DATA SUBREPORTS_RAW "  ;
        $qCount = "SELECT count(1) as TOTAL  ";
        $qFrom =" FROM $table RE ";
        $qJoin1 = " LEFT JOIN ( SELECT REPORT_ID, LISTAGG(CONCAT(CONCAT(ID,'*'), NAME), '|') WITHIN GROUP (ORDER BY ID) SUBREPORTS_DATA, COUNT(1) TOTAL FROM  $subtable WHERE STATUS = 1 GROUP BY REPORT_ID) TOTALS on TOTALS.REPORT_ID = RE.ID ";
        $qWhere = "  WHERE 1 = 1 ";
        $orderColumn = 'ID';
        $orderDirection = "DESC";

        if (!empty($data->name) && $data->name)  $qWhere .= " AND lower(RE.NAME) LIKE '%' || lower('$data->name') || '%'";
        if (!empty($data->sort) && $data->sort) $orderColumn = strtoupper($data->sort);
        if (!empty($data->sort_dir) && $data->sort_dir) $orderDirection = strtoupper($data->sort_dir);
        if (!empty($data->limit) && $data->limit) {
            $lowerLimit  = $data->limit * ($data->page -1) + 1;
            $upperLimit = $data->limit * $data->page;
            
            $qPaginationPart1 = "SELECT * FROM (SELECT A.*, ROWNUM RNUM FROM ( ";
            $qPaginationPart2 = " ) A WHERE ROWNUM <= $upperLimit) WHERE RNUM >= $lowerLimit ";
        }
        $qOrder =  " ORDER BY RE.$orderColumn $orderDirection ";
        $qFullSelect = "$qFields $qFrom $qJoin1 $qWhere $qOrder";

        $query = $qFullSelect;
        if (!empty($data->limit) && $data->limit) $query = "$qPaginationPart1 $qFullSelect $qPaginationPart2";

        // var_dump($query); die();
        $list = $this->getList($query);
        $count = $this->getList("$qCount $qFrom $qJoin1  $qWhere $qOrder");

        foreach($list as $report)
        {
            $rows = explode("|", $report->SUBREPORTS_RAW);
            $report->SUBREPORTS_ROWS  = array();
            foreach($rows as $subreport_data)
            {   
               if ($subreport_data) {
                list($id, $value) = explode("*", $subreport_data);
                if ($id) $report->SUBREPORTS_ROWS[] = array("ID"=>$id, "NAME"=>$value);
               }
            }
        }
        
        return [
            "status" => 200,
            "results" => [
                "count"=> $count[0]->TOTAL,
                "list" => $list
            ]
        ];
    }

     public function fetchById($report_id='')
    {
        $query = "SELECT * from kpi_reports where ID = $report_id";
        $report = $this->getList($query)[0];
        $q2 = "SELECT ID, NAME from kpi_subreports where REPORT_ID = $report_id  AND STATUS  = 1  ORDER BY ID ASC";
        $subreports =  $this->getList($q2);
        
        $report->sub = $subreports;
        foreach($subreports as $value)
        {
            $report->subreports[] = $value->NAME;
        }
        
        // return $report;
        return [
            "status" => 200,
            "results" => $report
        ];
    }

    public function save($data)
    {   
        $results['error'] = '';
        $table = $this->tables->reports->name;
        $query = "INSERT INTO $table (ID, NAME) VALUES ($this->newId, '$data->NAME')";
        $results = $this->execQuery($query);

        if ($results['error']) return $this->jsonResponse($results, 500);

        if (count($data->sub))
        {   
            $lastId = $this->getLastId();
            foreach($data->sub as $value)
            {   
                $subreport = (object)$value;
                $table = $this->tables->subreports->name;
                $seq = $this->tables->subreports->seq;
                $query = "INSERT INTO $table (ID, NAME, REPORT_ID) VALUES ($seq.nextval, '$subreport->NAME', $lastId)";
                $results = $this->execQuery($query);
                var_dump($query); die();
                if ($results['error'])  return $this->jsonResponse($response, 500);
            }
        }
        
        if ($results['error'])  return $this->jsonResponse($results, 500);
        return $this->jsonResponse([ "code"=> '001', "message" => 'ok' ], 200);
    }

    public function update($data)
    {   
        
        $results['error'] = '';
        $table = $this->tables->reports->name;
        $query = "UPDATE $table SET NAME = '$data->NAME' WHERE ID = '$data->ID'";
        $results = $this->execQuery($query);
        if ($results['error'])  return $this->jsonResponse($results, 500);

        $subreport = $this->tables->subreports->name;
        $results = $this->execQuery("UPDATE  KPI_SUBREPORTS SET STATUS = 0 where REPORT_ID = $data->ID");
        
        if ($results['error'])  return $this->jsonResponse($results, 500);

        if ($data->sub && count($data->sub))
        {
        
            
            foreach($data->sub as $value)
            {
                $subReportData = (object)$value;

                if (!empty($subReportData->ID)) {
                    $seq = $this->tables->subreports->seq;
                    $query = "UPDATE KPI_SUBREPORTS SET NAME = '$subReportData->NAME', STATUS = 1  WHERE ID =  $subReportData->ID";
                    $results = $this->execQuery($query);
                    if ($results['error'])  return $this->jsonResponse($results, 500);
                } else {

                    $table = $this->tables->subreports->name;
                    $seq = $this->tables->subreports->seq;
                    $query = "INSERT INTO $table (ID, NAME, REPORT_ID) VALUES ($seq.nextval, '$subReportData->NAME', $data->ID)";
                    $results = $this->execQuery($query);
                    if ($results['error'])  return $this->results($response, 500);
                }

                
            }
        }
        
        if ($results['error'])  return $this->jsonResponse($results, 500);

         return $this->jsonResponse([ "code"=> '001', "message" => 'ok' ], 200);
    }

    public function delete($report_id)
    {
        
        $results = $this->execQuery("DELETE FROM $this->table where ID = $report_id");
        if ($results['error'])  return $this->jsonResponse($results, 500);

        $subreport = $this->tables->subreports->name;
        $results = $this->execQuery("DELETE FROM $subreport where REPORT_ID = $report_id");
        if ($results['error'])  return $this->jsonResponse($results, 500);

         return $this->jsonResponse([ "code"=> '001', "message" => 'Elimmando correctamente' ], 200);

    }

    
}
