<?php

namespace App\Presenters;

use App\Model,
	Nette,
	Nette\Application\BadRequestException,
	Nette\Application\Responses;


/**
 * Recorder presenter.
 * Enables users to record their own videos.
 */
class RecorderPresenter extends BasePresenter {

	/** @var Model\Recording */
	private $recordingModel = NULL;

	/** @var Model\Audio */
	private $audioModel = NULL;

	/**
	 * DI - inject recording model
	 * @param  Model\Recording $rm
	 * @return void
	 */
	public function injectRecordingModel(Model\Recording $rm) {
		if ($this->recordingModel === NULL) {
			$this->recordingModel = $rm;
		}
	}

	/**
	 * DI - inject audio model
	 * @param  Model\Audio $am
	 * @return void
	 */
	public function injectAudioModel(Model\Audio $am) {
		if ($this->audioModel === NULL) {
			$this->audioModel = $am;
		}
	}

	/**
	 * Prepare the video player - load data from the DB and make sure it is ready.
	 * @param  int $id 		ID of the recording to be played
	 * @return void
	 */
	public function actionDefault() {
		// define path to files
		define("DATA_DIR", __DIR__ . "/../../videos/");		
	}

	/**
	 * Provide xml stream of recording's data as HTTP response.
	 * @return void
	 */
	public function handleUploadXml() {
		$filePath = DATA_DIR . $_REQUEST["id"];
		if(file_exists($filePath) || mkdir($filePath)) {
			$filePath = "$filePath/data.xml";
			$xmlProlog = '<?xml version="1.0"?>';
			$xml = $xmlProlog . $_REQUEST["rawData"];
			if(file_put_contents($filePath, $xml) && ($recording = $this->recordingModel->add($_REQUEST["title"], $_REQUEST["author"], $_REQUEST["description"], $filePath))) {
				$this->getHttpResponse()->setCode(Nette\Http\IResponse::S200_OK);
				$this->sendResponse(new Responses\JsonResponse([
					"success" => "XML data saved.",
					"recordingId" => $recording->id
				]));
			}

			// if the file was written and an error occured, make sure it doesn't exist
			@unlink($filePath); // do not show any errors - the file probably doesn't exist after all
		}

		$this->getHttpResponse()->setCode(Nette\Http\IResponse::S500_INTERNAL_SERVER_ERROR);
		$this->sendResponse(new Responses\JsonResponse([
			"error" => "Upload failed."
		]));
	}


	/**
	 * Provide audio stream of recording's audio track as HTTP response.
	 * @param  string $type 	File type of the requested audio track, that is related to currently played video recording. 	
	 * @return void
	 */
	public function handleUploadAudio() {
		// this variable will be used just for user's feedback
		// and only if something goes wrong
		$failiureReason = "Unknown.";

		if(isset($_FILES["wav"]) && !$_FILES["wav"]["error"]) {
			$id = $_REQUEST["id"];
			$recordingId = $_REQUEST["recordingId"];
			$dir = DATA_DIR . $id;
			$recording = $this->audioModel->upload($recordingId, $dir, $_FILES["wav"]["tmp_name"]);

			if($recording !== FALSE) {				
				$this->getHttpResponse()->setCode(Nette\Http\IResponse::S200_OK);
				$this->sendResponse(new Responses\JsonResponse([
					"succcess" 			=> TRUE,
					"message"			=> "Audio recording was successfully uploaded and saved.",
					"audioConversion"	=> $recording->type !== "wav"
				 ]));
			} else {
				$failiureReason = "Database error.";
			}
		} else if(isset($_FILES["wav"])) {
			// the upload did not go well - report the reason of failiure
			switch ($_FILES["wav"]["error"]) {
				case UPLOAD_ERR_INI_SIZE:
					$failiureReason = "The file is larger than maximum allowed by the server.";
					break;
				case UPLOAD_ERR_PARTIAL: 
					$failiureReason = "The file was only partialy uploaded.";
					break;
				case UPLOAD_ERR_NO_FILE:
					$failiureReason = "No file was uploaded.";
					break;
				case UPLOAD_ERR_NO_TMP_DIR:
					$failiureReason = "Missing temporary folder.";
					break;
				case UPLOAD_ERR_CANT_WRITE:
					$failiureReason = "Can't write to disk.";
				default:
					$failiureReason = "Unspecified upload error.";
			}
		} else {
			$failiureReason = "Server has received no audio data.";
			\Tracy\Debugger::log($_FILES);
		}	

		// If anything went wrong, the 200 response wasn't sent
		$this->getHttpResponse()->setCode(Nette\Http\IResponse::S500_INTERNAL_SERVER_ERROR);
		$this->sendResponse(new Responses\JsonResponse([
			"error" 	=> "Upload failed.",
			"message"	=> $failiureReason
		]));
	}

	/**
	 * Respond with a JSON containing link to given recording 
	 * @param  int $recordingId
	 * @return void
	 */
	public function handleGetLink($recordingId) {
		$this->sendResponse(new Responses\JsonResponse([
			"url" => $this->link("Player:", $recordingId)
		]));
	}

}
