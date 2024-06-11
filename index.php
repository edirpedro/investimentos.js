<?php

// Provendo um header adequado para impedir o cache da página

header('Cache-Control: no-cache, no-store, must-revalidate, max-age=0');
header('Pragma: no-cache');
echo file_get_contents('index.html');
