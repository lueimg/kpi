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

}
