<?php
require_once __DIR__ . '/../controllers/PedidosController.php';
(new PedidosController())->handlePublic($segments);
