<?php

namespace App\Model;

use App\Model\ReportsModel;
use App\Model\ContentModel;

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
