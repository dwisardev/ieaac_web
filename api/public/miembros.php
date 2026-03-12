<?php
require_once __DIR__ . '/../controllers/MiembrosController.php';
(new MiembrosController())->handlePublic(array_slice($segments, 1));
