<?php
require_once __DIR__ . '/../controllers/CronogramaController.php';
(new CronogramaController())->handlePublic(array_slice($segments, 1));
