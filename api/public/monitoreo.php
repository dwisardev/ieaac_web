<?php
require_once __DIR__ . '/../controllers/MonitoreoController.php';
(new MonitoreoController())->handlePublic($segments);
