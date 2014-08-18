<?php

$dir = "data/" . $_REQUEST["fileName"]; // it was already created by save.php

$filePath = $dir . "/data.mp3";
$fp = fopen($filePath, "w+");

// pull the raw binary data from the POST array
$data = substr($_POST['data'], strpos($_POST['data'], ",") + 1);
// decode it
$decodedData = base64_decode($data);
fwrite($fp, $decodedData);
fclose($fp);

header("Content-type: application/json");
header("Status: 200 OK");
echo json_encode([
	"response"	=> "Data saved to $dir.",
	"path"	=> $filePath
]);
exit;