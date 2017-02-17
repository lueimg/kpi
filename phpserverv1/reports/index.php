<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

require '../models.php';

$requestType = $_SERVER['REQUEST_METHOD'];

$data = (object)$_REQUEST;
$model = new ReportsModel();
$results = [];

if ($requestType === 'GET') {
    
    if (!empty($data->reportId)) {
        $results = $model->fetchById($data->reportId);
    } else {
        $results = $model->fetchAll($data);
    }
} elseif($requestType === 'POST') {
    $data = (object)json_decode(file_get_contents("php://input"), true);
    // var_dump($data); die();
     $results = $model->save($data);

} elseif($requestType === 'PUT') {

     $data = (object)json_decode(file_get_contents("php://input"), true);
     $results = $model->update($data);

} elseif($requestType === 'DELETE') {

     $results = $model->delete($data->reportId);
}




print(json_encode($results));