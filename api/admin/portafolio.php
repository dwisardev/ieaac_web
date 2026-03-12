<?php
require_once __DIR__ . '/../controllers/PortafolioController.php';
(new PortafolioController())->handle($segments, $auth['data']);
