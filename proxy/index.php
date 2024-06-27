
<?php

/**
 * Evitando problemas de Cross-Ogirin
 * /proxy/?refresh - Marca os dados para atualização
 * /proxy/?name=ATIVO&url=https://... - Retorna dados armazenados ou os coleta
 */

set_time_limit(0);
error_reporting(0);

// Marca os arquivos para atualização evitando ficar sem dados quando falha

if (isset($_GET['refresh'])) {
  foreach (glob("cache/*") as $file)
    rename($file, "{$file}.refresh");
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
  if (json_last_error() == JSON_ERROR_NONE) {
    file_put_contents("cache/{$name}.json", $json);
    unlink("cache/{$name}.json.refresh");
  } else {
    file_put_contents("error.log", date('d/m/Y H:i:s') . " {$name} {$url}\n", FILE_APPEND);
    rename("cache/{$name}.json.refresh", "cache/{$name}.json");
  }
}

// Retorna os dados de um arquivo

header('Content-Type: application/json; charset=utf-8');
echo file_exists("cache/{$name}.json") ? file_get_contents("cache/{$name}.json") : '{}';
