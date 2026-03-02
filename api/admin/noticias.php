<?php
/**
 * api/admin/noticias.php
 * Delegado al NoticiasController
 */

require_once __DIR__ . '/../controllers/NoticiasController.php';

$controller = new NoticiasController();
$controller->handle(
    $segments,    // viene del index.php: ['noticias'] | ['noticias','5'] | ['noticias','5','destacar']
    $auth['data'] // viene del index.php: { userId, username, email, rol }
);