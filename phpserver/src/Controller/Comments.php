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
         
         switch ($subPage) {
            default:
                $results =  $this->model->fetchByKey($key);
         }

        return $response->withJson($results, $results['status']);
    }

    protected function postAction($request , $response)
    {
        $results = $this->model->save((object)$request->getParams());
        return $response->withJson($results, $results['status']);
    }

    
   

}
