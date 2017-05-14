<?php
$data =  json_decode(file_get_contents("php://input"), true);
$found = false;
// var_dump(json_encode($data));

$filedata = json_decode(file_get_contents('data.json'),true);
foreach ($filedata as $i => $item) {
	if($item['id'] == $data['id']){
		$found = true;
		$filedata[$i][$data['key']] = $data['val'];
	}
}
if($found){
	file_put_contents('data.json', json_encode($filedata));
	echo "{'status':'success'}";
}
else
	echo "{'status':'error'}";
?>