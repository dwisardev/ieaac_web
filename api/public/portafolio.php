<?php
require_once __DIR__ . '/../controllers/PortafolioController.php';
(new PortafolioController())->handlePublic($segments);
