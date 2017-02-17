<?php

namespace App\Model;

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
