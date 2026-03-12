<?php
require_once __DIR__ . '/../controllers/InformeController.php';
(new InformeController())->handle($segments, $auth['data']);
