<?php

namespace App\Model;

abstract class Model
{
    
    protected $connection;
    protected $query;
    protected $tables = [];
    protected $newId =  '';
    protected $currentId = '';


    // protected $rows;
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
            "content" =>   (object) array('name'=> "KPI_CONTENT", 'seq' => 'kpi_content_seq'),
            "queries" =>   (object) array('name'=> "KPI_QUERIES", 'seq' => 'kpi_queries_seq'),
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
			$result = array('error'=>$e['message']) ;
			oci_rollback($this->connection);
		}
        else
        { 
            $result = oci_commit($this->connection); 
        }
		
		return $result;
    }

    // require el uso de sequences
    public function getLastId()
    {
        // @todo : se debe definir protected $seq, en cada model para usar esta funcion
        $query= "SELECT $this->seq.currval id FROM dual";
        return $this->getList($query)[0]->ID;
    }


    public function insert($query)
    {
        $result = $this->execQuery($query);
        if ($result)  return $this->getLastId();
        
        return $result;
    }

    public function jsonResponse($data, $status = 200)
    {
        return [
            "status" => $status,
            "results" => $data
        ];
    }

}
