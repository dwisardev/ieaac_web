<?php
require_once __DIR__ . '/../controllers/DocentesController.php';
// $segments may be ['docentes'] or ['public','docentes'] or [...,'id']
// Pass only the trailing numeric ID (or empty for list)
$last = end($segments);
(new DocentesController())->handlePublic(is_numeric($last) ? [$last] : []);
