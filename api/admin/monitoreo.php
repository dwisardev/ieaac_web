<?php
require_once __DIR__ . '/../controllers/MonitoreoController.php';
(new MonitoreoController())->handle($segments, $auth['data']);
