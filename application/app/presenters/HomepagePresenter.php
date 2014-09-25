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

	public function injectRecordingsModel(Model\Recording $rm) {
		$this->recordingsModel = $rm;
	}

	public function renderDefault() {
		$this->template->recordings = $this->recordingsModel->getAll()->order("recorded_on DESC");
	}

	public function handleDelete($id) {
		$recording = $this->recordingsModel->get($id);
		
		$everythingWasDeleted = unlink($recording->file_path);
		foreach($recording->related("audio") as $audio) {
			$everytingWasDeleted = unlink($audio->file_path) ? $everythingWasDeleted : FALSE;			
		}

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
