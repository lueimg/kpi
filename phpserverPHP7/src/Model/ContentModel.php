<?php

namespace App\Model;

class ContentModel extends Model
{
    
    protected $newId =  '';
    protected $currentId = '';
    protected $seq = '';
    protected $table= '';
    protected $totalColumnValues = 6;
   
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
        $qFields = "SELECT CON.ID, 
                            CON.NAME, 
                            CON.PROCEDURE, 
                            CON.WEEKSRANGE, 
                            CON.CONTENT_TYPE, 
                            CON.REPORT_ID, 
                            CON.SUBREPORT_ID , 
                            REP.NAME REPORT_NAME, 
                            SUB.NAME SUBREPORT_NAME,
                            GRA.GRAPHICS_TOTAL, 
                            GRA.GRAPHICS_DATA "  ;

        $qCount = "SELECT count(1) as TOTAL  ";
        $qFrom =" FROM KPI_CONTENTS CON
        LEFT JOIN KPI_REPORTS REP ON REP.ID = CON.REPORT_ID 
        LEFT JOIN KPI_SUBREPORTS SUB ON SUB.ID = CON.SUBREPORT_ID
        LEFT JOIN (SELECT CONTENT_ID, COUNT(1) GRAPHICS_TOTAL, LISTAGG(ID||'*'||TITLE, '|') WITHIN GROUP (ORDER BY ID) GRAPHICS_DATA FROM  KPI_GRAPHICS WHERE STATUS = 1 GROUP BY CONTENT_ID) GRA 
            ON GRA.CONTENT_ID = CON.ID ";
        
        $qWhere = "  WHERE 1 = 1  AND CON.ID = $content_id";
        $orderColumn = 'ID';
        $orderDirection = "ASC";
        $qFullSelect = "$qFields $qFrom $qWhere";

        $result = $this->getList($qFullSelect)[0];
        $result->WEEKSRANGE = $result->WEEKSRANGE*1;

        // graphics
        $result->graphs = [];
        if ($result->GRAPHICS_TOTAL > 0) {
            $rows = explode("|", $result->GRAPHICS_DATA);
            foreach($rows as $row) {
                $data = explode("*", $row);
                $graphicId =  $data[0];

                $kpis = $this->getList("SELECT * FROM KPI_GRAPHICS_KPIS WHERE GRAPHIC_ID = $graphicId AND STATUS  = 1");
                
                $result->graphs[] = array(
                    "id" => $data[0],
                    "title" => $data[1],
                    "kpis" => $kpis);
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
        $query = "INSERT INTO $table (
                             ID, 
                             NAME, 
                             REPORT_ID, 
                             PROCEDURE,
                             CONTENT_TYPE, 
                             WEEKSRANGE  
                             $subReportField)  
                    VALUES ( $this->newId, 
                            '$data->NAME', 
                             $data->REPORT_ID, 
                            '$data->PROCEDURE', 
                            '$data->CONTENT_TYPE', 
                            '$data->WEEKSRANGE' 
                             $subReportIdValue)";
        $results = $this->execQuery($query);

        if ($results['error']) return $this->jsonResponse($results, 500);

        $contentID = $this->getLastId();
       
        if (count($data->graphs))
        {   
            foreach($data->graphs as $graphic)
            {
                $graph = (object)$graphic;

                $graphicsTable = $this->tables->graphics->name;
                $seqGraphics = $this->tables->graphics->seq;
                
                $query = "INSERT INTO $graphicsTable (ID, CONTENT_ID, TITLE) VALUES ($seqGraphics.nextval, $contentID, '$graph->title')";
                $results = $this->execQuery($query);
                if (is_array($results) && !empty($results['error']))  return $this->jsonResponse($results, 500);

                // Insert graphics kpis (grupos)
                if (count($graph->kpis))
                {   
                    foreach($graph->kpis as $kpi)
                    {
                        $data = (object)$kpi;
                        // $seriesTable = $this->tables->series->name;
                        $seqSeries = $this->tables->series->seq;
                        $seqGraphic =  $this->tables->graphics->seq;
                        $oppositeValue = (empty($data->OPPOSITE)) ? 0 : ($data->OPPOSITE == 1) ? 1: 0;
                        
                        $query = "INSERT INTO KPI_GRAPHICS_KPIS (
                            ID, 
                            GRAPHIC_ID, 
                            GRAPHIC_TYPE, 
                            TITLE, 
                            NAME_FROM_PROCEDURE, 
                            YAXIS_GROUP, 
                            SUFFIX, 
                            OPPOSITE) 
                            VALUES (
                            $seqSeries.nextval, 
                            $seqGraphic.currval, 
                            '$data->GRAPHIC_TYPE', 
                            '$data->TITLE', 
                            '$data->NAME_FROM_PROCEDURE', 
                             $data->YAXIS,
                            '$data->SUFFIX',
                             $oppositeValue
                            )";
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

        $query = "UPDATE $table SET  
                            NAME = '$data->NAME', 
                            REPORT_ID = $data->REPORT_ID ,  
                            WEEKSRANGE = $data->WEEKSRANGE ,  
                            CONTENT_TYPE = '$data->CONTENT_TYPE' ,  
                            PROCEDURE = '$data->PROCEDURE'  
                            $subReportField $subReportIdValue  
                            WHERE ID = $data->ID";

        $contentId = $data->ID;

        $results = $this->execQuery($query);
        if ($results['error']) return $this->jsonResponse($results, 500);


        $results = $this->execQuery("UPDATE KPI_GRAPHICS SET STATUS = 0 where CONTENT_ID = $contentId");
        if ($results['error'])  return $this->jsonResponse($results, 500);

        if (count($data->graphs) > 0)
        {   
            foreach($data->graphs as $graphic)
            {
                $graph = (object)$graphic;

                $graphicsTable = $this->tables->graphics->name;
                $seqGraphics = $this->tables->graphics->seq;

                if (!empty($graph->id)) {
                    $query = "UPDATE $graphicsTable SET  TITLE = '$graph->title',  STATUS = 1  WHERE ID = $graph->id";
                    $results = $this->execQuery($query);
                    if (is_array($results) && !empty($results['error']))  return $this->jsonResponse($results, 500);

                    // Update KPIS
                    if (count($graph->kpis))
                    {   
                        foreach($graph->kpis as $kpi)
                        {
                            $data = (object)$kpi;

                            $seriesTable = $this->tables->series->name;
                            $seqSeries = $this->tables->series->seq;
                            $seqGraphic =  $this->tables->graphics->seq;
                            $oppositeValue = (empty($data->OPPOSITE)) ? 0 : ($data->OPPOSITE == 1) ? 1: 0;

                            $query= "UPDATE KPI_GRAPHICS_KPIS SET 
                                            GRAPHIC_TYPE        = '$data->GRAPHIC_TYPE',
                                            TITLE               = '$data->TITLE', 
                                            SUFFIX              = '$data->SUFFIX', 
                                            NAME_FROM_PROCEDURE = '$data->NAME_FROM_PROCEDURE', 
                                            YAXIS_GROUP         = '$data->YAXIS_GROUP',
                                            OPPOSITE            = $oppositeValue
                                            WHERE ID = $data->ID";
                           
                            $results = $this->execQuery($query);
                            if (is_array($results) && !empty($results['error']))  return $this->jsonResponse($results, 500);
                        }
                    }

                } else {
                    // Create new graphic
                    $query = "INSERT INTO $graphicsTable (ID, CONTENT_ID, TITLE)  VALUES ($seqGraphics.nextval, $contentId, '$graph->title')";
                    $results = $this->execQuery($query);
                    if (is_array($results) && !empty($results['error']))  return $this->jsonResponse($results, 500);

                    // Insert kpis
                    if (count($graph->kpis))
                    {   
                        foreach($graph->kpis as $kpi)
                        {
                            $data = (object)$kpi;
                            // $seriesTable = $this->tables->series->name;
                            $seqSeries = $this->tables->series->seq;
                            $seqGraphic =  $this->tables->graphics->seq;
                            $oppositeValue = (empty($data->OPPOSITE)) ? 0 : ($data->OPPOSITE == 1) ? 1: 0;
                            
                            $query = "INSERT INTO KPI_GRAPHICS_KPIS (
                                ID, 
                                GRAPHIC_ID, 
                                GRAPHIC_TYPE, 
                                TITLE, 
                                NAME_FROM_PROCEDURE, 
                                YAXIS_GROUP, 
                                SUFFIX, 
                                OPPOSITE) 
                                VALUES (
                                $seqSeries.nextval, 
                                $seqGraphic.currval, 
                                '$data->GRAPHIC_TYPE', 
                                '$data->TITLE', 
                                '$data->NAME_FROM_PROCEDURE', 
                                $data->YAXIS,
                                '$data->SUFFIX',
                                $oppositeValue
                                )";
                            $results = $this->execQuery($query);
                            if (is_array($results) && !empty($results['error']))  return $this->jsonResponse($results, 500);
                        }
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

    public function verifyKpis ($data) 
    {
        $anio = $data->anio ;
        $semana= $data->semana;
        $antiguedad = $data->antiguedad;
        $procedure =$data->procedure;

        $query = "BEGIN $procedure($semana, $anio, $antiguedad ); END;";
        $results = $this->execQuery($query);
        if ($results['error'])  return $this->jsonResponse($results, 500);
        $result = [];

         for ($i=1; $i < $this->totalColumnValues ; $i++) { 
            $data = $this->getList("SELECT DISTINCT(ELEMENTO) FROM $this->temporalTable WHERE VALOR$i IS NOT NULL");
            if (count($data) > 0) {
                $result[] ='VALOR'.$i;
            }
        }

        return [
            "status" => 200,
            "results" => $result
        ];


    }

    public function verifySeries ($data)
    {
        // var_dump($data);die();
        $anio = $data->anio ;
        $semana= $data->semana;
        $antiguedad = $data->antiguedad;
        $procedure =$data->procedure;

        // $anio = 2017;
        // $semana= 1;
        // $antiguedad = 10;
        // $procedure ="sp_test_multiaxis";

        $query = "BEGIN $procedure($semana, $anio, $antiguedad ); END;";
        $results = $this->execQuery($query);
        if ($results['error'])  return $this->jsonResponse($results, 500);
        $result = [];
        // Get data from Temporal
        for ($i=1; $i < 7 ; $i++) { 
            $data = $this->getList("SELECT DISTINCT(ELEMENTO) FROM $this->temporalTable WHERE VALOR$i IS NOT NULL");
            
            foreach($data as $row) {
                $result[] = $row->ELEMENTO. '-VALOR'.$i;
            }
        }
        
         return [
            "status" => 200,
            "results" => $result
        ];

    }
    
}
