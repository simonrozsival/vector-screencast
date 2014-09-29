-- Adminer 4.1.0 MySQL dump

SET NAMES utf8;
SET time_zone = '+00:00';
SET foreign_key_checks = 0;
SET sql_mode = 'NO_AUTO_VALUE_ON_ZERO';

DROP TABLE IF EXISTS `audio`;
CREATE TABLE `audio` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `recording_id` int(11) NOT NULL,
  `file_path` varchar(200) NOT NULL,
  `type` enum('mp3','ogg','wav') NOT NULL,
  PRIMARY KEY (`id`),
  KEY `recording_id` (`recording_id`),
  CONSTRAINT `audio_ibfk_1` FOREIGN KEY (`recording_id`) REFERENCES `recording` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


DROP TABLE IF EXISTS `recording`;
CREATE TABLE `recording` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(40) NOT NULL,
  `author` varchar(50) NOT NULL,
  `description` tinytext NOT NULL,
  `file_path` varchar(200) NOT NULL,
  `recorded_on` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


-- 2014-09-29 07:46:44