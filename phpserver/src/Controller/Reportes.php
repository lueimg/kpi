<?php

namespace App\Controller;

use App\Model\Reportes as ReportesModel;

class Reportes extends Controller
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
        $reportes = new ReportesModel();

        return $reportes->fetchAll();
    }
}
