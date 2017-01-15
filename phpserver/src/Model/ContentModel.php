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
        $qFields = "SELECT CON.ID, CON.NAME, CON.REPORT_ID, CON.SUBREPORT_ID , REP.NAME REPORT_NAME, SUB.NAME SUBREPORT_NAME, GRA.GRAPHICS_TOTAL "  ;
        $qCount = "SELECT count(1) as TOTAL  ";
        $qFrom =" FROM KPI_CONTENTS CON
                    LEFT JOIN KPI_REPORTS REP ON REP.ID = CON.REPORT_ID 
                    LEFT JOIN KPI_SUBREPORTS SUB ON SUB.ID = CON.SUBREPORT_ID
                    LEFT JOIN (SELECT CONTENT_ID, COUNT(1) GRAPHICS_TOTAL FROM  KPI_GRAPHICS WHERE STATUS = 1 GROUP BY CONTENT_ID) GRA ON GRA.CONTENT_ID = CON.ID ";
        $qWhere = "  WHERE 1 = 1 AND CON.STATUS = 1  ";
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

        $list = $this->getList($query);
        $count = $this->getList("$qCount $qFrom  $qWhere $qOrder");

        
        return [
            "status" => 200,
            "results" => [
                "count"=> $count[0]->TOTAL,
                "list" => $list
            ]
        ];
    }

     public function fetchById($content_id='')
    {
       $table = $this->tables->reports->name;
        $subtable = $this->tables->subreports->name;
        $qFields = "SELECT CON.ID, CON.NAME, CON.PROCEDURE, CON.WEEKSRANGE, CON.REPORT_ID, CON.SUBREPORT_ID , REP.NAME REPORT_NAME, SUB.NAME SUBREPORT_NAME, FIELDS.FIELDS_TOTAL, FIELDS.FIELDS_DATA, GRA.GRAPHICS_TOTAL, GRA.GRAPHICS_DATA "  ;
        $qCount = "SELECT count(1) as TOTAL  ";
        $qFrom =" FROM KPI_CONTENTS CON
        LEFT JOIN KPI_REPORTS REP ON REP.ID = CON.REPORT_ID 
        LEFT JOIN KPI_SUBREPORTS SUB ON SUB.ID = CON.SUBREPORT_ID
        LEFT JOIN (SELECT CONTENT_ID, LISTAGG(CONCAT(CONCAT(ID,'*'), NAME), '|') WITHIN GROUP (ORDER BY ID) FIELDS_DATA, COUNT(1) FIELDS_TOTAL FROM  KPI_CONTENTS_FIELDS WHERE STATUS = 1 GROUP BY CONTENT_ID) FIELDS ON FIELDS.CONTENT_ID = CON.ID
        LEFT JOIN (SELECT CONTENT_ID, COUNT(1) GRAPHICS_TOTAL, LISTAGG(ID||'*'||TITLE||'*'||TYPE||'*'||UNID, '|') WITHIN GROUP (ORDER BY ID) GRAPHICS_DATA FROM  KPI_GRAPHICS WHERE STATUS = 1 GROUP BY CONTENT_ID) GRA ON GRA.CONTENT_ID = CON.ID ";
        
        $qWhere = "  WHERE 1 = 1  AND CON.ID = $content_id";
        $orderColumn = 'ID';
        $orderDirection = "ASC";
        $qFullSelect = "$qFields $qFrom $qWhere";

        $result = $this->getList($qFullSelect)[0];

        // queries
        $result->FIELDS = [];
        if ($result->FIELDS_TOTAL > 0) {
           
            $fields = explode("|", $result->FIELDS_DATA);
            foreach($fields as $field) {
                $data = explode("*", $field);
                $result->FIELDS[] = $data[1];
                // $query_indexes[] = $data[0];
            }
        }

        // graphics
        $result->graphs = [];
        if ($result->GRAPHICS_TOTAL > 0) {
            $rows = explode("|", $result->GRAPHICS_DATA);
            foreach($rows as $row) {
                $data = explode("*", $row);
                $series = $this->getList("SELECT * FROM KPI_SERIES WHERE GRAPHIC_ID = $data[0] AND STATUS  = 1");
                
                $result->graphs[] = array(
                    "title" => $data[1],
                    "graphic_type"=>$data[2], 
                    "und"=>$data[3], 
                    "series"=> $series);
            }
        }
        return [
            "status" => 200,
            "results" => $result
        ];
    }

    public function save($data)
    {   
        $results['error'] = '';
        $queries_index = array();
        $table = $this->table;
        $subReportField = !empty($data->SUBREPORT_ID) && $data->SUBREPORT_ID ?  ' , SUBREPORT_ID ' : '';
        $subReportIdValue =  !empty($data->SUBREPORT_ID) && $data->SUBREPORT_ID ?  ', ' . $data->SUBREPORT_ID : '';
        $query = "INSERT INTO $table (ID, NAME, REPORT_ID, PROCEDURE, WEEKSRANGE  $subReportField)  VALUES ($this->newId, '$data->NAME', $data->REPORT_ID, '$data->PROCEDURE', '$data->WEEKSRANGE' $subReportIdValue)";
        $results = $this->execQuery($query);
        if ($results['error']) return $this->jsonResponse($results, 500);

        $contentTableLastId = $this->getLastId();
        
        if (count($data->FIELDS))
        {   
            foreach($data->FIELDS as $field)
            {
                $queriesTable = $this->tables->contents_fields->name;
                $seq = $this->tables->contents_fields->seq;
                $query = "INSERT INTO $queriesTable (ID, NAME, CONTENT_ID) VALUES ($seq.nextval, '$field', $contentTableLastId)";
                $results = $this->insert($query, $seq);
                if (is_array($results) && !empty($results['error']))  return $this->jsonResponse($results, 500);
            }
        }

        if (count($data->graphs))
        {   
            foreach($data->graphs as $graphic)
            {
                $graph = (object)$graphic;
                $graphicsTable = $this->tables->graphics->name;
                $seqGraphics = $this->tables->graphics->seq;
                
                $query = "INSERT INTO $graphicsTable (ID, CONTENT_ID, TYPE, UNID, TITLE) 
                VALUES ($seqGraphics.nextval, $contentTableLastId, '$graph->graphic_type', '$graph->und', '$graph->title')";

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
        
        return $this->jsonResponse([ "code"=> '001', "message" => 'ok' ], 200);
    }

    public function update($data)
    {   
        $results['error'] = '';
        $queries_index = array();
        $table = $this->table;
        $subReportField = !empty($data->SUBREPORT_ID) && $data->SUBREPORT_ID ?  ' , SUBREPORT_ID = ' : '';
        $subReportIdValue = !empty($data->SUBREPORT_ID) && $data->SUBREPORT_ID ?  '' . $data->SUBREPORT_ID : '';

        $query = "UPDATE $table SET  NAME = '$data->NAME', REPORT_ID = $data->REPORT_ID ,  WEEKSRANGE = $data->WEEKSRANGE ,  PROCEDURE = '$data->PROCEDURE'  $subReportField $subReportIdValue  WHERE ID = $data->ID";

        $results = $this->execQuery($query);
        if ($results['error']) return $this->jsonResponse($results, 500);

        $results = $this->execQuery("UPDATE KPI_CONTENTS_FIELDS SET STATUS = 0 where CONTENT_ID = $data->ID");
        if ($results['error'])  return $this->jsonResponse($results, 500);

        if (count($data->FIELDS))
        {   
            foreach($data->FIELDS as $value)
            {
                $secondaryTable = $this->tables->contents_fields->name;
                $seq = $this->tables->contents_fields->seq;
              
                $query = "INSERT INTO $secondaryTable (ID, NAME, CONTENT_ID) VALUES ($seq.nextval, '$value', $data->ID)";
                $results = $this->insert($query, $seq);
                if (is_array($results) && !empty($results['error']))  return $this->jsonResponse($results, 500);
            }
        }

        $results = $this->execQuery("UPDATE KPI_GRAPHICS SET STATUS = 0 where CONTENT_ID = $data->ID");
        if ($results['error'])  return $this->jsonResponse($results, 500);

        if (count($data->graphs))
        {   
            foreach($data->graphs as $graphic)
            {
                $graph = (object)$graphic;
                $graphicsTable = $this->tables->graphics->name;
                $seqGraphics = $this->tables->graphics->seq;
                $query = "INSERT INTO $graphicsTable (ID, TITLE, CONTENT_ID, TYPE, UNID) 
                            VALUES ($seqGraphics.nextval, '$graph->title', $data->ID, '$graph->graphic_type', '$graph->und')";

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

    public function delete($content_id)
    {
        $results = $this->execQuery("UPDATE $this->table SET STATUS = 0 where ID = $content_id");
        if ($results['error'])  return $this->jsonResponse($results, 500);

         return $this->jsonResponse([ "code"=> '001', "message" => 'Elimmando correctamente' ], 200);

    }

    
}
