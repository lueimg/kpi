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
        $table = $this->tables->reports->name;
        $subtable = $this->tables->subreports->name;
        $qFields = "SELECT CON.ID, CON.NAME, CON.REPORT_ID, CON.SUBREPORT_ID , REP.NAME REPORT_NAME, SUB.NAME SUBREPORT_NAME, QUE.QUERIES_TOTAL, QUE.QUERIES_DATA, GRA.GRAPHICS_TOTAL "  ;
        $qCount = "SELECT count(1) as TOTAL  ";
        $qFrom =" FROM KPI_CONTENTS CON
                    LEFT JOIN KPI_REPORTS REP ON REP.ID = CON.REPORT_ID 
                    LEFT JOIN KPI_SUBREPORTS SUB ON SUB.ID = CON.SUBREPORT_ID
                    LEFT JOIN (SELECT CONTENT_ID, LISTAGG(CONCAT(CONCAT(ID,'*'), QUERY), '|') WITHIN GROUP (ORDER BY ID) QUERIES_DATA, COUNT(1) QUERIES_TOTAL FROM  KPI_QUERIES GROUP BY CONTENT_ID) QUE ON QUE.CONTENT_ID = CON.ID
                    LEFT JOIN (SELECT CONTENT_ID, COUNT(1) GRAPHICS_TOTAL FROM  KPI_GRAPHICS GROUP BY CONTENT_ID) GRA ON GRA.CONTENT_ID = CON.ID ";
        $qWhere = "  WHERE 1 = 1 ";
        $orderColumn = 'ID';
        $orderDirection = "ASC";

        if (!empty($data->name) && $data->name)  $qWhere .= " AND lower(CON.NAME) LIKE '%' || lower('$data->name') || '%' ";
        if (!empty($data->sort) && $data->sort) $orderColumn = strtoupper($data->sort);
        if (!empty($data->sort_dir) && $data->sort_dir) $orderDirection = strtoupper($data->sort_dir);
        if (!empty($data->limit) && $data->limit) {
            $lowerLimit  = $data->limit * ($data->page -1) + 1;
            $upperLimit = $data->limit * $data->page;
            
            $qPaginationPart1 = "SELECT * FROM (SELECT A.*, ROWNUM RNUM FROM ( ";
            $qPaginationPart2 = " ) A WHERE ROWNUM <= $upperLimit) WHERE RNUM >= $lowerLimit ";
        }
        $qOrder =  " ORDER BY CON.$orderColumn $orderDirection ";
        $qFullSelect = "$qFields $qFrom $qWhere $qOrder";

        $query = $qFullSelect;
        if (!empty($data->limit) && $data->limit) $query = "$qPaginationPart1 $qFullSelect $qPaginationPart2";

        // $this->debugger($query);
        $list = $this->getList($query);
        $count = $this->getList("$qCount $qFrom  $qWhere $qOrder");

        // foreach($list as $report)
        // {
        //     $rows = explode("|", $report->SUBREPORTS_RAW);
        //     $report->SUBREPORTS_ROWS  = array();
        //     foreach($rows as $subreport_data)
        //     {   
        //        if ($subreport_data) {
        //         list($id, $value) = explode("*", $subreport_data);
        //         if ($id) $report->SUBREPORTS_ROWS[] = array("ID"=>$id, "NAME"=>$value);
        //        }
        //     }
        // }
        
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

                // Insert Series

                if (count($graph->series))
                {   
                    foreach($graph->series as $serie)
                    {
                        $serieObj = (object)$serie;
                        $seriesTable = $this->tables->series->name;
                        $seqSeries = $this->tables->series->seq;
                        $seqGraphic =  $this->tables->graphics->seq;
                        $query = "INSERT INTO $seriesTable (ID, GRAPHIC_ID, SUBGRAPHIC_TYPE, NAME, COLUMNA) 
                                    VALUES ($seqSeries.nextval, $seqGraphic.currval, '$serieObj->SUBGRAPHIC_TYPE', '$serieObj->NAME', '$serieObj->COLUMNA')";
                        $results = $this->execQuery($query);
                        if (is_array($results) && !empty($results['error']))  return $this->jsonResponse($results, 500);
                    }
                }
            }
        }
        
        return $this->jsonResponse([ "code"=> '001', "message" => 'ok' ], 201);
    }

    public function update($data)
    {   
         return $this->jsonResponse([ "code"=> '001', "message" => 'ok' ], 200);
    }

    public function delete($content_id)
    {

        $results = $this->execQuery("DELETE FROM $this->table where ID = $content_id");
        if ($results['error'])  return $this->jsonResponse($results, 500);

         return $this->jsonResponse([ "code"=> '001', "message" => 'Elimmando correctamente' ], 200);

    }

    
}
