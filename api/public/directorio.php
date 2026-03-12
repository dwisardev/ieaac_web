<?php
require_once __DIR__ . '/../controllers/DirectorioController.php';
(new DirectorioController())->handlePublic($segments);
