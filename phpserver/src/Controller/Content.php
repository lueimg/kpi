<?php

namespace App\Controller;

use App\Model\ContentModel;
use Slim\Http\Request;
use Slim\Http\Response;

class Content extends Controller
{
    
    protected $model;

    function __construct(Request $request, Response $response) 
    {
        parent::__construct($request, $response);
        $this->model = new ContentModel();
    }

    protected function getAction($request, $response)
    {
        // $report_id = $this->getUrlSegment(1);
        // $results = array();

        // // listado
        // if (!$report_id) 
        //     $results = $this->model->fetchAll();
        // else {
        //     // Seleccion por id
        //     $results = $this->model->fetchById($report_id);
        // }

        return $response->withJson(["saludo"=>'hola'], 200);
    }

    
    protected function postAction($request , $response)
    {
        $results = $this->model->save((object)$request->getParams());
        return $response->withJson($results, $results['status']);
    }

    protected function putAction($request, $response)
    {
        $data = $request->getParams();
        $results = $this->model->update((object)$data);
        return $response->withJson($results, $results['status']);

    }
    
    protected function deleteAction($request, $response)
    {
        $report_id = $this->getUrlSegment(1);
        $results = $this->model->delete($report_id);
        return $response->withJson($results, $results['status']);
    }

}
