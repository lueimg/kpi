<?php

namespace App\Controller;

use App\Model\CommentModel;
use Slim\Http\Request;
use Slim\Http\Response;

class Comments extends Controller
{
    
    protected $model;

    function __construct(Request $request, Response $response) 
    {
        parent::__construct($request, $response);
        $this->model = new CommentModel();
    }

    protected function getAction($request, $response)
    {   
        $results = [];
        $key = $this->getUrlSegment(1);
        if (!empty($key)) {
            $results =  $this->model->fetchByKey($key);
        } else {
             $results = $this->model->fetchAll((object)$request->getParams());
        }
        return $response->withJson($results, $results['status']);
    }

    protected function postAction($request , $response)
    {
        $results = $this->model->save((object)$request->getParams());
        return $response->withJson($results, $results['status']);
    }

     protected function putAction($request , $response)
    {
        $results = $this->model->update((object)$request->getParams());
        return $response->withJson($results, $results['status']);
    }

    protected function deleteAction($request, $response)
    {
        $ID = $this->getUrlSegment(1);
        $results = $this->model->delete((object)$request->getParams());
        return $response->withJson($results, $results['status']);
    }

    
   

}
