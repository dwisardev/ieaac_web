<?php
require_once __DIR__ . '/../controllers/DocumentosController.php';
(new DocumentosController())->handlePublic($segments);
