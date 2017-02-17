<?php

abstract class Model
{
    
    protected $connection;
    protected $query;
    protected $tables = [];
    protected $newId =  '';
    protected $currentId = '';
    protected $temporalTableGraphic = "KPI_TMP_REP_GRAFICO";
    protected $temporalTable = "KPI_TMP_REP_GRAFICO";
    protected $tmpTableGraphic = "";

    /**
     * Constructor.
     *
     */
    public function __construct()
    {
        $this->connection = oci_connect('system', 'oracle', 'oracledb/XE');
        if (!$this->connection) {
            $m = oci_error();
            echo $m['message'], "\n";
            exit;
        }
        $this->tables = (object) [ 
            "reports" =>   (object) array('name'=> "KPI_REPORTS", 'seq' => 'kpi_reports_seq'),
            "subreports" =>   (object) array('name'=> "KPI_SUBREPORTS", 'seq' => 'kpi_subreports_seq'),
            "content" =>   (object) array('name'=> "KPI_CONTENTS", 'seq' => 'kpi_content_seq'),
            "contents_fields" =>   (object) array('name'=> "KPI_CONTENTS_FIELDS", 'seq' => 'kpi_content_fields_seq'),
            "graphics" =>   (object) array('name'=> "KPI_GRAPHICS", 'seq' => 'kpi_graphics_seq'),
            "series" =>   (object) array('name'=> "KPI_SERIES", 'seq' => 'kpi_series_seq'),
            "comments" =>   (object) array('name'=> "KPI_COMMENTS", 'seq' => 'kpi_comments_seq'),
        ];
        
    }

    public function getList($query = '') {
        try {
            // $query =  ($this->query) ? $this->query : $query;
            $stid = oci_parse($this->connection, $query);
            oci_execute($stid);
            $result=array();
            while (($row = oci_fetch_object($stid)) != false) {
                array_push($result, $row); 
            }

            oci_free_statement($stid);

            return $result;	
        }
        catch (Exception $e){
            return $e;
        }
        	
    }

    public function execQuery($query = '')
    {
        $stid = oci_parse($this->connection, $query); 	
		$r = oci_execute($stid, OCI_NO_AUTO_COMMIT);
		if (!$r) {
			$e = oci_error($stid);
			$result = array('error'=>$e['message'], "query"=>$query) ;
			oci_rollback($this->connection);
		}
        else
        { 
            $result = oci_commit($this->connection); 
        }
		
		return $result;
    }

    // require el uso de sequences
    public function getLastId($seq = '')
    {
        // @todo : se debe definir protected $seq, en cada model para usar esta funcion

        if ($seq == '') {
            $seq = $this->seq; // propiedad definida en cada modelo
        }

        $query= "SELECT $seq.currval id FROM dual";
        return $this->getList($query)[0]->ID;
    }


    public function insert($query, $seq = '')
    {
        $result = $this->execQuery($query);
        if ($result)  return $this->getLastId($seq);
        
        return $result;
    }

    public function jsonResponse($data, $status = 200)
    {
        return [
            "status" => $status,
            "results" => $data
        ];
    }

    public function debug($data) {
        var_dump($data);
        die();
    }

    public function getListFromTemporalTableGraphic() {
        return  $this->getList("SELECT * FROM $this->temporalTableGraphic");
    }

    public function getListFromTemporalTable() {
        return  $this->getList("SELECT * FROM $this->temporalTable");
    }

}


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

class CommentModel extends Model
{
    
    protected $newId =  '';
    protected $currentId = '';
    protected $seq = '';
    protected $table= '';
    protected $reportsModel;
   
    function __construct()
    {
        parent::__construct();

        $this->seq = $this->tables->comments->seq;
        $this->table = $this->tables->comments->name;
        $this->newId = $this->seq . '.nextval';
        $this->currentId = $this->seq.'.currval';
    
    }

    public function fetchAll($data = [])
    {  
       
        $table = $this->table;
        $qFields = "SELECT * "  ;
        $qCount = "SELECT count(1) as TOTAL  ";
        $qFrom =" FROM $table RE ";
        // $qJoin1 = " LEFT JOIN ( SELECT REPORT_ID, LISTAGG(CONCAT(CONCAT(ID,'*'), NAME), '|') WITHIN GROUP (ORDER BY ID) SUBREPORTS_DATA, COUNT(1) TOTAL FROM  $subtable GROUP BY REPORT_ID) TOTALS on TOTALS.REPORT_ID = RE.ID ";
        $qJoin1 = '';
        $qWhere = "  WHERE 1 = 1 AND STATUS = 1 ";
        $orderColumn = 'ID';
        $orderDirection = "ASC";

        if (!empty($data->name) && $data->name)  $qWhere .= " AND lower(USUARIO||COMENTARIO) LIKE '%' || lower('$data->name') || '%'";
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


        $list = $this->getList($query);
        $count = $this->getList("$qCount $qFrom $qJoin1  $qWhere $qOrder");
        
        return [
            "status" => 200,
            "results" => [
                "count"=> $count[0]->TOTAL,
                "list" => $list
            ]
        ];
    }

   

    public function fetchByKey($key) {
        
       $query = "SELECT * FROM KPI_COMMENTS WHERE STATUS =1 AND KEYID = $key ORDER BY CREATED_AT DESC";
       $list = $this->getList($query);

        return [
            "status" => 200,
            "results" => [
                "list" => $list
            ]
        ];

    }

    public function save($data)
    {
        $table = $this->table;
        $query = "INSERT INTO $table (ID, USUARIO, COMENTARIO, KEYID)  
            VALUES ($this->newId, '$data->user', '$data->comment', $data->key)";
        $results = $this->execQuery($query);
        if ($results['error']) return $this->jsonResponse($results, 500);

        return $this->jsonResponse([ "code"=> '001', "message" => 'ok' ], 200);

    }

    public function update($data)
    {
        $table = $this->table;
        $query = "UPDATE $table SET USUARIO= '$data->user' , COMENTARIO = '$data->comment' WHERE ID = $data->id";
        $results = $this->execQuery($query);
        if ($results['error']) return $this->jsonResponse($results, 500);

        return $this->jsonResponse([ "code"=> '001', "message" => 'ok' ], 200);

    }

    public function delete($data)
    {
        
        $results = $this->execQuery("UPDATE $this->table SET STATUS = 0 where id = $data->id");
        if ($results['error'])  return $this->jsonResponse($results, 500);

         return $this->jsonResponse([ "code"=> '001', "message" => 'Elimmando correctamente' ], 200);

    }

}

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
        $this->commentModel = new CommentModel();

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

    /**
    * $data->conntent_id
    * $data->year
    * $data->week
    */
    public function contentsById($data = []) {
        
        $content = $this->contentModel->fetchById($data->content_id)['results'];
        
        // $this->debug($data);
        // Execute Procedure
        $anio = $data->year;
        $semana= $data->week;
        $antiguedad = $content->WEEKSRANGE;
        $procedure =$content->PROCEDURE;
        $query = "BEGIN $procedure($semana, $anio, $antiguedad ); END;";
        $this->execQuery($query);

        // Validad que no hay graficos
        // Consultar la otra tabla temporal
        // Deveolver todo el htmlentities
        
        if ($content->CONTENT_TYPE == 'grafico') {
            $tmpTable = $this->getListFromTemporalTableGraphic();
        } else {
            $tmpTable = $this->getListFromTemporalTable();
        }

        return [
            "status" => 200,
            "results" => [
                "content_id" => $data->content_id,
                "type" => $content->CONTENT_TYPE,
                "graphics" => $content->graphs, 
                "data"=> $tmpTable
            ]
        ];

    }

    public function allContent($data = []) {
        $week = $data->week;
        $anio = $data->year;

        $reports = $this->reportsMenu()["results"]['list'];
        $graphicList = [];
        // Addin generateContentForGraphics
        foreach($reports as &$report) {
           if (count($report['contents']) > 0) {
               $contentData = [];
               foreach($report['contents'] as &$content) {
                    $query = (object)[];
                    $query->content_id = $content->ID;
                    $query->year = $anio;
                    $query->week = $week;
                    $graphics = (object)$this->contentsById($query)['results']; // return an array
                    $content->graphics = $graphics->graphics;
                    $contentData = $graphics->data;
                    
                    // Add coments each graphic
                    if (count($content->graphics) > 0) {
                        foreach($content->graphics as &$graphic) {
                            $comments = $this->commentModel->fetchByKey($graphic['id'])["results"]['list'];
                            $graphic['data'] = $contentData;
                            $graphic['comments'] = (array)$comments;
                        }
                    }
                    $graphicList = array_merge($graphicList, $content->graphics);
               }
           }
           if (count($report['subreports']) > 0) {
               foreach($report['subreports'] as &$subreport) {
                    if (count($subreport['contents']) > 0) {
                        foreach($subreport['contents'] as &$content) {
                            $query = (object)[];
                            $query->content_id = $content->ID;
                            $query->year = $anio;
                            $query->week = $week;
                            $graphics = (object)$this->contentsById($query)['results']; // return an array
                            $content->graphics = $graphics->graphics;
                            $contentData = $graphics->data;
                            
                            // Add coments each graphic
                            if (count($content->graphics) > 0) {
                                foreach($content->graphics as &$graphic) {
                                    $comments = $this->commentModel->fetchByKey($graphic['id'])["results"]['list'];
                                    $graphic['data'] = $contentData;
                                    $graphic['comments'] = (array)$comments;
                                }
                            }
                            $graphicList = array_merge($graphicList, $content->graphics);
                        }
                    }
               }
           }
        }

        return [
            "status" => 200,
            "results" => [
                "list" => $reports,
                "graphics" => $graphicList
            ]
        ];

    }

    

}