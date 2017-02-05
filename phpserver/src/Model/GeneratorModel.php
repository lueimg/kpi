<?php

namespace App\Model;

use App\Model\ReportsModel;
use App\Model\ContentModel;
use App\Model\CommentModel;

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
        
        
       // Get data from Temporal
        $tmpTableGraphic = $this->getListFromTemporalTableGraphic();
        
        $data = [ 
            "graphics" => $content->graphs, 
            "data"=> $tmpTableGraphic
        ];

        return [
            "status" => 200,
            "results" => $data
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
