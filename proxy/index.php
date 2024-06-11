
<?php

/**
 * Evitando problemas de Cross-Ogirin
 * /proxy/?clear - Limpeza do cache
 * /proxy/?name=ATIVO&url=https://... - Retorna dados armazenados ou os coleta
 */

set_time_limit(0);
error_reporting(0);

// Limpa os dados em cache

if (isset($_GET['clear'])) {
  array_map('unlink', array_filter((array) glob("cache/*")));
  exit;
}

// Coleta os dados e armazena em cache

$name = isset($_GET['name']) ? basename($_GET['name']) : null;
$url = isset($_GET['url']) ? urldecode($_GET['url']) : null;

if ($url && !file_exists("cache/{$name}.json")) {
  $ch = curl_init();
  curl_setopt($ch, CURLOPT_URL, $url);
  curl_setopt($ch, CURLOPT_HEADER, 0);
  curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
  curl_setopt($ch, CURLOPT_USERAGENT, $_SERVER['HTTP_USER_AGENT']);
  $json = curl_exec($ch);
  curl_close($ch);
  json_decode($json);
  if (json_last_error() == JSON_ERROR_NONE)
    file_put_contents("cache/{$name}.json", $json);
}

// Retorna os dados de um arquivo

header('Content-Type: application/json; charset=utf-8');
if (file_exists("cache/{$name}.json"))
  echo file_get_contents("cache/{$name}.json");
else
  echo '{}';
