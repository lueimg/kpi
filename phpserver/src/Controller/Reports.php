<?php

namespace App\Controller;

use App\Model\Reports as ReportsModel;

class Reports extends Controller
{
    /**
     * Get all books.
     *
     * @param \Slim\Http\Request
     * @param \Slim\Http\Response
     * @return object
     */
    protected function getAction($request, $response)
    {
        $reportes = new ReportsModel();

        return $reportes->fetchAll();
    }
}
