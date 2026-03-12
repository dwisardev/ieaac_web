<?php
require_once __DIR__ . '/../controllers/BannersController.php';
(new BannersController())->handle($segments, $auth['data']);
