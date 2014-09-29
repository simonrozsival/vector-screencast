<?php

namespace App\Presenters;

use Nette,
	App\Model;


/**
 * Homepage presenter.
 * Gives the user list of all public videos.
 */
class HomepagePresenter extends BasePresenter {

	/** @var Model\Recording */
	private $recordingsModel = NULL;

	/**
	 * DI injection
	 * @param  ModelRecording $rm
	 */
	public function injectRecordingsModel(Model\Recording $rm) {
		$this->recordingsModel = $rm;
	}

	/**
	 * Default page shows list of all recordings.
	 */
	public function renderDefault() {
		$this->template->recordings = $this->recordingsModel->getAll()->order("recorded_on DESC");
	}

	/**
	 * Delete a video.
	 * This method deletes all files and db records of the video.
	 * @param  int $id	Video record ID.
	 */
	public function handleDelete($id) {
		$recording = $this->recordingsModel->get($id);
		
		// try to delete as many files as possible
		$everythingWasDeleted = file_exists($recording->file_path) ? unlink($recording->file_path) : TRUE;
		foreach($recording->related("audio") as $audio) {
			if(!file_exists($audio->file_path) || @unlink($audio->file_path)) {
				$audio->delete(); // I can delete this recording now
			} else {
				$everytingWasDeleted = FALSE;
			}
		}

		// delete the DB record only if all files were 
		if($everythingWasDeleted && $recording->delete()) {
			$this->flashMessage("Video was deleted.", "success");
		} else {
			$this->flashMessage("Some records could not be deleted.", "danger");
		}

		if(!$this->isAjax()) {
			$this->redirect("this");
		}
	}

}
