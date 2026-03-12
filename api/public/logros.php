<?php
require_once __DIR__ . '/../controllers/LogrosController.php';
(new LogrosController())->handlePublic($segments);
