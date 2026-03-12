<?php
require_once __DIR__ . '/../controllers/HorariosController.php';
(new HorariosController())->handle($segments, $auth['data']);
