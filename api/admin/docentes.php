<?php
require_once __DIR__ . '/../controllers/DocentesController.php';
(new DocentesController())->handle($segments, $auth['data']);
