<?php

namespace App\Controller;

use App\Model\Reports as ReportsModel;
use Slim\Http\Request;
use Slim\Http\Response;

class Reports extends Controller
{
    
    protected $model;

    function __construct(Request $request, Response $response) 
    {
        parent::__construct($request, $response);
        $this->model = new ReportsModel();
    }

    protected function getAction($request, $response)
    {
        return $this->model->fetchAll();
    }

    /**
     * Get book specified by id in URL segment.
     *
     * @param \Slim\Http\Request
     * @param \Slim\Http\Response
     * @return object
     */
    protected function postAction($request , $response)
    {
        // return $this->request->getParsedBody();
        // return $this->request->getParam("id");
        // return $this->request->getParams();
        // return $this->request->getParsedBody();
        // return $this->request->getBody();
       
        $data = $request->getParams();
        return $this->model->save((object)$data);
    }

}
