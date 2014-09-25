<?php

namespace App\Model;

use Nette;


/**
 * Video recordings.
 */
class Recording extends BaseModel {

	/** @var string */
	protected $table = "recording";

	const
		COLUMN_ID = 'id',
		COLUMN_TITLE = 'title',
		COLUMN_AUTHOR = 'author',
		COLUMN_DESCRIPTION = 'description',
		COLUMN_FILE_PATH = 'file_path';

	public function add($title, $author, $description, $filePath) {
		return $this->table()->insert([
			self::COLUMN_TITLE		=> $title,
			self::COLUMN_AUTHOR		=> $author,
			self::COLUMN_DESCRIPTION 	=> $description,
			self::COLUMN_FILE_PATH	=> $filePath,
		]);
	}
		
}
