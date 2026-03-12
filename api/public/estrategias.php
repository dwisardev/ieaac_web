<?php
require_once __DIR__ . '/../controllers/EstrategiasController.php';
(new EstrategiasController())->handlePublic(array_slice($segments, 1));
