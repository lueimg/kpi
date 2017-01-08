<?php

namespace App\Model;

class Reports extends Model
{
    
    protected $newId =  '';
    protected $currentId = '';
    protected $seq = '';
   
    function __construct()
    {
        parent::__construct();
        $this->seq = $this->tables->reports->seq;
        $this->newId = $this->seq . '.nextval';
        $this->currentId = $this->seq.'.currval';
    }

    public function fetchAll($data = [])
    {   
        $table = $this->tables->reports->name;
        $subtable = $this->tables->subreports->name;
        $qList = "SELECT RE.ID, RE.NAME, TOTALS.TOTAL SUBREPORTS "  ;
        $qCount = "SELECT count(1) as TOTAL  ";
        $qFrom =" FROM $table RE
                left join ( select SRE.REPORT_ID, count(1) TOTAL FROM $subtable SRE group by SRE.REPORT_ID) TOTALS on TOTALS.REPORT_ID = RE.ID";
        $list = $this->getList("$qList $qFrom");
        $count = $this->getList("$qCount $qFrom");

        
        return [
            "results" => [
                "count"=> $count[0]->TOTAL,
                "list" => $list
            ]
        ];

    }

    public function save($data)
    {   
        $response['error'] = '';
        $table = $this->tables->reports->name;
        $query = "INSERT INTO $table VALUES ($this->newId, '$data->name')";
        $lastId = $this->insert($query);

        if (count($data->subreports))
        {
            foreach($data->subreports as $key=>$value)
            {
                $table = $this->tables->subreports->name;
                $seq = $this->tables->subreports->seq;
                $query = "INSERT INTO $table VALUES ($seq.nextval, '$value', $lastId)";
                $this->execQuery($query);
            }
        }
        
        if ($response['error']) {
            return $response;
        }

         return [
            "results" => [
                "code"=> '001',
                "message" => 'ok',
                'id' => $response
            ]
        ];

    }
    
}
