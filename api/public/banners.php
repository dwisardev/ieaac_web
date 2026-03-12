<?php
require_once __DIR__ . '/../controllers/BannersController.php';
(new BannersController())->handlePublic($segments);
