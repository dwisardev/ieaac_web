<?php
require_once __DIR__ . '/../controllers/LogrosController.php';
(new LogrosController())->handle($segments, $auth['data']);
