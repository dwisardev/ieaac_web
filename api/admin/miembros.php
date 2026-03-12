<?php
require_once __DIR__ . '/../controllers/MiembrosController.php';
(new MiembrosController())->handle($segments, $auth['data']);
