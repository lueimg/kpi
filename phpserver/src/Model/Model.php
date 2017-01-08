<?php

namespace App\Model;

abstract class Model
{
    
    protected $connection;
    protected $query;
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
        
    }

    public function dbQuery($query = '') {
        // $query =  ($this->query) ? $this->query : $query;
        $stid = oci_parse($this->connection, $query);
        oci_execute($stid);
        $list = [];
        while ($row = oci_fetch_array($stid, OCI_ASSOC+OCI_RETURN_NULLS)) {
            $list[] = $row;
        }
        // $this->rows = $list;
        return $list;
    }
}
