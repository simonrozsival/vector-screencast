<?php

$dir = "../data/" . date("Y-m-d_H-i-s");
mkdir($dir);

$fp = fopen($dir . "/data." . $_REQUEST["format"], "w+");
fwrite($fp, $_REQUEST["rawData"]);
fclose($fp);

header("Content-type: application/json");
header("Status: 200 OK");
echo json_encode([
	"response"	=> "Data saved to $dir.",
	"rawData"	=> $_REQUEST["rawData"]
]);
exit;