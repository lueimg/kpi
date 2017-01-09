<?php

namespace App\Model;

class ContentModel extends Model
{
    
    protected $newId =  '';
    protected $currentId = '';
    protected $seq = '';
    protected $table= '';
   
    function __construct()
    {
        parent::__construct();

        $this->seq = $this->tables->content->seq;
        $this->table = $this->tables->content->name;

        $this->newId = $this->seq . '.nextval';
        $this->currentId = $this->seq.'.currval';
        
    }

    public function fetchAll($data = [])
    {   
        $table = $this->table;
        $subtable = $this->tables->subreports->name;
        $qList = "SELECT RE.ID, RE.NAME, TOTALS.TOTAL SUBREPORTS "  ;
        $qCount = "SELECT count(1) as TOTAL  ";
        $qFrom =" FROM $table RE
                left join ( select SRE.REPORT_ID, count(1) TOTAL FROM $subtable SRE group by SRE.REPORT_ID) TOTALS on TOTALS.REPORT_ID = RE.ID 
                ORDER BY RE.ID ASC";

        $list = $this->getList("$qList $qFrom");
        $count = $this->getList("$qCount $qFrom");
        
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
        $q2 = "SELECT NAME from kpi_subreports where REPORT_ID = $report_id ORDER BY ID ASC";
        $subreports =  $this->getList($q2);
        
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
        $queries_index = array();
        $table = $this->table;
        $subReportField = $data->SUBREPORT_ID ?  ' , SUBREPORT_ID ' : '';
        $subReportIdValue =  $data->SUBREPORT_ID ?  ', ' . $data->SUBREPORT_ID : '';
        $query = "INSERT INTO $table (ID, NAME, REPORT_ID  $subReportField)  VALUES ($this->newId, '$data->NAME', $data->REPORT_ID $subReportIdValue)";
        $results = $this->execQuery($query);
        if ($results['error']) return $this->jsonResponse($results, 500);

        $contentTableLastId = $this->getLastId();
        
        if (count($data->queries))
        {   
            foreach($data->queries as $value)
            {
                $queriesTable = $this->tables->queries->name;
                $seq = $this->tables->queries->seq;
                $query = "INSERT INTO $queriesTable (ID, QUERY, CONTENT_ID) 
                            VALUES ($seq.nextval, '$value', $contentTableLastId)";
                $results = $this->insert($query, $seq);
                if (is_array($results) && !empty($results['error']))  return $this->jsonResponse($results, 500);
                
                $queries_index[] = $results;
            }
        }

        if (count($data->graphs))
        {   
            foreach($data->graphs as $graphic)
            {
                $graph = (object)$graphic;
                $graphicsTable = $this->tables->graphics->name;
                $seqGraphics = $this->tables->graphics->seq;
                $seqQuery =  $this->tables->queries->seq;
                $query_id = $queries_index[$graph->query_index];
                $query = "INSERT INTO $graphicsTable (ID, QUERY_ID, CONTENT_ID, GRAPHIC_TYPE_ID, UNIDAD) 
                            VALUES ($seqGraphics.nextval, $query_id, $contentTableLastId, '$graph->graphic_type', '$graph->und')";

                $results = $this->execQuery($query);
                if (is_array($results) && !empty($results['error']))  return $this->jsonResponse($results, 500);
            }
        }
        
        return $this->jsonResponse([ "code"=> '001', "message" => 'ok' ], 201);
    }

    public function update($data)
    {   
        
        $results['error'] = '';
        $table = $this->table;
        $query = "UPDATE $table SET NAME = '$data->NAME' WHERE ID = '$data->ID'";
        $results = $this->execQuery($query);
        if ($results['error'])  return $this->jsonResponse($results, 500);

        $subreport = $this->tables->subreports->name;
        $results = $this->execQuery("DELETE FROM $subreport where REPORT_ID = $data->ID");
        if ($results['error'])  return $this->jsonResponse($results, 500);

        if ($data->subreports && count($data->subreports))
        {
            $subreport = $this->tables->subreports->name;
            
            foreach($data->subreports as $key=>$value)
            {
                $seq = $this->tables->subreports->seq;
                $query = "INSERT INTO $subreport VALUES ($seq.nextval, '$value', $data->ID)";
                $results = $this->execQuery($query);
                if ($results['error'])  return $this->jsonResponse($results, 500);
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
