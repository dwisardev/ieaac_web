<?php
require_once __DIR__ . '/../controllers/PlanLectorController.php';
(new PlanLectorController())->handle($segments, $auth['data']);
