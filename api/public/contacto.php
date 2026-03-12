<?php
require_once __DIR__ . '/../controllers/ContactoController.php';
(new ContactoController())->handlePublic($segments);
