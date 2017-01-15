<?php

namespace App\Controller;

use App\Model\GeneratorModel;
use Slim\Http\Request;
use Slim\Http\Response;

class Generator extends Controller
{
    
    protected $model;

    function __construct(Request $request, Response $response) 
    {
        parent::__construct($request, $response);
        $this->model = new GeneratorModel();
    }

    protected function getAction($request, $response)
    {
        $results =  $this->model->fetchAll((object)$request->getParams());
        return $response->withJson($results, $results['status']);
    }

    
   

}
