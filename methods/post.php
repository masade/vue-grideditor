<?php
$data =  json_decode(file_get_contents("php://input"), true);
// var_dump(json_encode($data));exit;

$filedata = json_decode(file_get_contents('data.json'),true);
// var_dump(expression)
$data['id'] = count($filedata) + 1 ;
array_unshift($filedata, $data);
file_put_contents('data.json', json_encode($filedata));
echo json_encode($data);
?>