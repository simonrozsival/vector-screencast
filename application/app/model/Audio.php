<?php

namespace App\Model;

use Nette;


/**
 * Audio recordings.
 */
class Audio extends BaseModel {

	/** @var string */
	protected $table = "audio";

	const
		COLUMN_ID = 'id',
		COLUMN_RECORDING_ID = 'recording_id',
		COLUMN_FILE_PATH = 'file_path',
		COLUMN_TYPE = 'type';

	public function upload($recordingId, $filePath, $tmpName) {

		if($this->detectFFmpeg()) {
			$data = [
				self::COLUMN_RECORDING_ID	=> $recordingId,
				self::COLUMN_FILE_PATH		=> "$filePath/recording.mp3",
				self::COLUMN_TYPE			=> "mp3",
			];

			$dest = $data[self::COLUMN_FILE_PATH];
			$cmd = "ffmpeg -i $tmpName $dest";
			exec($cmd);

			if(file_exists($dest)) {
				return $this->table()->insert($data);
			}
		} else {			
			$data = [
				self::COLUMN_RECORDING_ID	=> $recordingId,
				self::COLUMN_FILE_PATH		=> "$filePath/recording.wav",
				self::COLUMN_TYPE			=> "wav",
			];
			if(move_uploaded_file($tmpName, $data[self::COLUMN_FILE_PATH]) === TRUE) {
				return $this->table()->insert($data);
			}
		}

		return FALSE;
	}

	private function detectFFmpeg() {
		if(function_exists("exec")) {
			exec("ffmpeg -h", $output, $ret);
			return $ret === 0; // succeeded
		}

		return FALSE;
	}
}
