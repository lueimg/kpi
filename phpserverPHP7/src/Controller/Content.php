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
        $content_id = $this->getUrlSegment(1);

        $results =  ($content_id) ? 
            $this->model->fetchById($content_id) : 
            $this->model->fetchAll((object)$request->getParams());

        return $response->withJson($results, $results['status']);
    }

    
    protected function postAction($request , $response)
    {

        $options = $this->getUrlSegment(1);

        switch ($options) {
            case 'verifySeries' : 
                $results =  $this->model->verifySeries((object)$request->getParams());
                break;
             case 'verifyKpis' : 
                $results =  $this->model->verifyKpis((object)$request->getParams());
                break;
            default:
                 $results = $this->model->save((object)$request->getParams());
         }

        // $results = $this->model->save((object)$request->getParams());
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
