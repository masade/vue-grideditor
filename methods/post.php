<?php
// sleep(2);
$data =  json_decode(file_get_contents("php://input"), true);

$filedata = json_decode(file_get_contents('data.json'),true);
// var_dump(expression)
$data['id'] = uniqid();
array_unshift($filedata, $data);
file_put_contents('data.json', json_encode($filedata));
echo json_encode($data);
?>