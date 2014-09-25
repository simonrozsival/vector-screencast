<?php

namespace App\Presenters;

use App\Model,
	Nette,
	Nette\Application\BadRequestException,
	Nette\Application\Responses;


/**
 * Player presenter.
 * Provides data for selected videos.
 */
class PlayerPresenter extends BasePresenter {

	/** @var Nette\Database\Table\ActiveRow Currently played recording */
	private $recording = NULL;

	/** @var Model\Recording */
	private $recordingModel = NULL;

	/**
	 * DI - inject the model
	 * @param  Model\Recording $rm
	 */
	public function injectRecordingModel(Model\Recording $rm) {
		if ($this->recordingModel === NULL) {
			$this->recordingModel = $rm;
		}

	}

	/**
	 * Prepare the video player - load data from the DB and make sure it is ready.
	 * @param  int $id 		ID of the recording to be played
	 */
	public function actionDefault($id) {
		$this->recording = $this->recordingModel->get($id);
		if($this->recording === FALSE) {
			// No recording! Throw Error 404
			throw new BadRequestException("Video you requested doesn't exist.");
		}

		// define path to files
		define("DATA_DIR", __DIR__ . "../../videos/");
	}

	/**
	 * The main place of the app. The video is played!
	 * @param  int $id 		ID of the recording to be played
	 */
	public function renderDefault($id) {
		$this->template->recording = $this->recording;
	}

	/**
	 * Provide xml stream of recording's data as HTTP response.
	 */
	public function handleDownloadXml() {
		//header("Content-type: text/xml");
		//readfile($this->recording->file_path);
		//exit;

		$this->sendResponse(new Responses\FileResponse($this->recording->file_path, "data.xml", "text/xml"));
		// file response throws BadRequestException if the file doesn't exist (or is a directory)
	}


	/**
	 * Provide audio stream of recording's audio track as HTTP response.
	 * @param  string $type 	File type of the requested audio track, that is related to currently played video recording. 	
	 */
	public function handleDownloadAudio($type) {
		$audio = $this->recording->related("audio")->where("type", $type)->fetch();
		if($audio !== FALSE) {			
			$this->sendResponse(new Responses\FileResponse($audio->file_path, "audio_track.$type", "audio/$type"));
			// file response throws BadRequestException if the file doesn't exist (or is a directory)
		} else {
			throw new BadRequestException("There is no '$type' audio recording for this video.");
		}
	}

}
