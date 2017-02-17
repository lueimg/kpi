<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

require '../models.php';

$requestType = $_SERVER['REQUEST_METHOD'];

$data = (object)$_REQUEST;
$model = new CommentModel();
$results = [];

if ($requestType === 'GET') {
    
    if (!empty($data->key)) {
        $results = $model->fetchByKey($data->key);
    } else {
        $results = $model->fetchAll($data);
    }
} elseif($requestType === 'POST') {
    $dataPayload = (object)json_decode(file_get_contents("php://input"), true);
    
    if (!empty($data->verifyKpis)) {
        
        $results =  $model->verifyKpis($dataPayload);
    } else {
        $results = $model->save($dataPayload);
    }    

} elseif($requestType === 'PUT') {

     $data = (object)json_decode(file_get_contents("php://input"), true);
     $results = $model->update($data);

} elseif($requestType === 'DELETE') {
    if (!empty($data->ID)) {
        $data->id = $data->ID;
    }

     $results = $model->delete($data);
}




print(json_encode($results));