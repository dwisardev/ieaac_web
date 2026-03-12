<?php
require_once __DIR__ . '/../controllers/EventosController.php';
(new EventosController())->handle($segments, $auth['data']);
