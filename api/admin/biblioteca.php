<?php
require_once __DIR__ . '/../controllers/BibliotecaController.php';
(new BibliotecaController())->handle($segments, $auth['data']);
