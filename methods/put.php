<?php
// sleep(2);
$data =  json_decode(file_get_contents("php://input"), true);
$found = false;
// var_dump($data);
$filedata = json_decode(file_get_contents('data.json'),true);
foreach ($filedata as $i => $item) {
	if(isset($data['id']) && ($item['id'] == $data['id'])){
		$found = true;
		$filedata[$i][$data['key']] = $data['val'];
		// var_dump($filedata[$i][$data['key']]);
	}
	// $filedata[$i]['id'] = uniqid();
}
if($found){
	file_put_contents('data.json', json_encode($filedata));
	echo "{'status':'success'}";
}
else
	echo "{'status':'error'}";
?>