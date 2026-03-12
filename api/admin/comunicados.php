<?php
require_once __DIR__ . '/../controllers/ComunicadosController.php';
(new ComunicadosController())->handle($segments, $auth['data']);
