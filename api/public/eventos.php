<?php
require_once __DIR__ . '/../controllers/EventosController.php';
(new EventosController())->handlePublic($segments);
