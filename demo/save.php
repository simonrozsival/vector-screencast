<?php

$dir = "data/" . date("Y-m-d_H-i-s");
mkdir($dir);
$filePath = $dir . "/data." . $_REQUEST["format"];
$fp = fopen($filePath, "w+");

$xmlProlog = "<?xml version=\"1.0\"?>";
fwrite($fp, $xmlProlog);
fwrite($fp, $_REQUEST["rawData"]);
fclose($fp);

header("Content-type: application/json");
header("Status: 200 OK");
echo json_encode([
	"response"	=> "Data saved to $dir.",
	"path"	=> $filePath
]);
exit;