<?php

namespace App\Model;

use Nette;


/**
 * Base model - the predecessor of all models.
 */
abstract class BaseModel extends Nette\Object {
	/** @var string */
	protected $table;

	/** @var Nette\Database\Context */
	private $database;

	public function __construct(Nette\Database\Context $database) {
		$this->database = $database;
	}

	protected function table() {
		return $this->database->table($this->table);
	}

	public function get($id) {
		return $this->table()->get($id);
	}

	public function getAll() {
		return $this->table();
	}
}
