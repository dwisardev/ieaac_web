<?php
require_once __DIR__ . '/../controllers/BibliotecaController.php';
(new BibliotecaController())->handlePublic($segments);
