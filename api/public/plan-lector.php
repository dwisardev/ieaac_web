<?php
require_once __DIR__ . '/../controllers/PlanLectorController.php';
(new PlanLectorController())->handlePublic($segments);
