<?php

// data
$fileName = $_REQUEST["fileName"];
$data = $_REQUEST["data"];

// prepare the file name
$dir = "data/$fileName"; // it was already created by save.php
$ext = analyzeExtension($data);
$filePath = "$dir/data.$ext";

saveData($filePath, $data);

function analyzeExtension($raw) {
	$start = strpos($raw, "/") + 1;
	$length = strpos($raw, ";") - $start;
	return substr($raw, $start, $length);
}

function saveData($path, $raw) {	
	$fp = fopen($path, "w+");
	// pull the raw binary data from the POST array
	$data = substr($raw, strpos($raw, ",") + 1);
	// decode it
	$decodedData = base64_decode($data);
	fwrite($fp, $decodedData);
	fclose($fp);
}

header("Content-type: application/json");
header("Status: 200 OK");
echo json_encode([
	"response"	=> "Data saved to $dir.",
	"path"	=> $filePath,
	"data"	=> $data
]);
exit;