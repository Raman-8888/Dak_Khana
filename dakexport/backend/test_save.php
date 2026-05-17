<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$e = new App\Models\ExportRequest();
$e->customer_id = '00000000-0000-0000-0000-000000000000';
$e->service_type_id = '00000000-0000-0000-0000-000000000000';
$e->status = 'draft';
$e->save();

print_r($e->toArray());
