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
	 */
	public function injectRecordingModel(Model\Recording $rm) {
		if ($this->recordingModel === NULL) {
			$this->recordingModel = $rm;
		}
	}

	/**
	 * DI - inject audio model
	 * @param  Model\Audio $am
	 */
	public function injectAudioModel(Model\Audio $am) {
		if ($this->audioModel === NULL) {
			$this->audioModel = $am;
		}
	}

	/**
	 * Prepare the video player - load data from the DB and make sure it is ready.
	 * @param  int $id 		ID of the recording to be played
	 */
	public function actionDefault() {
		// define path to files
		define("DATA_DIR", __DIR__ . "/../../videos/");		
	}

	/**
	 * Provide xml stream of recording's data as HTTP response.
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
			@unlink($filePath);
		}

		$this->getHttpResponse()->setCode(Nette\Http\IResponse::S500_INTERNAL_SERVER_ERROR);
		$this->sendResponse(new Responses\JsonResponse([ "error" => "Upload failed." ]));
	}


	/**
	 * Provide audio stream of recording's audio track as HTTP response.
	 * @param  string $type 	File type of the requested audio track, that is related to currently played video recording. 	
	 */
	public function handleUploadAudio() {
		if(isset($_FILES["wav"]) && !$_FILES["wav"]["error"]) {
			$id = $_REQUEST["id"];
			$recordingId = $_REQUEST["recordingId"];
			$dir = DATA_DIR . $id;
			$recording = $this->audioModel->upload($recordingId, $dir, $_FILES["wav"]["tmp_name"]);

			if($recording !== FALSE) {				
				$this->getHttpResponse()->setCode(Nette\Http\IResponse::S200_OK);
				$this->sendResponse(new Responses\JsonResponse([ "succcess" => TRUE ]));
			}
		}		

		$this->getHttpResponse()->setCode(Nette\Http\IResponse::S500_INTERNAL_SERVER_ERROR);
		$this->sendResponse(new Responses\JsonResponse([ "error" => "Upload failed." ]));
	}

	/**
	 * Respond with a JSON containing link to given recording 
	 * @param  int $recordingId
	 */
	public function handleGetLink($recordingId) {
		$this->sendResponse(new Responses\JsonResponse([
			"url" => $this->link("Player:", $recordingId)
		]));
	}

}
