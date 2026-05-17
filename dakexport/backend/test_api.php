<?php
$url = 'http://localhost:8000/api/v1/exports';
$data = array(
    'service_type_id' => '00000000-0000-0000-0000-000000000000',
    'sender' => array('name' => '', 'address' => '', 'city' => '', 'state' => '', 'postal_code' => '', 'phone' => ''),
    'receiver' => array('name' => 'Raman Negi', 'address' => 'lovely professional university', 'city' => '', 'state' => '', 'postal_code' => '', 'country_code' => 'US', 'phone' => '9258482708'),
    'package' => array('weight_grams' => 34000, 'content_description' => 'huuu', 'declared_value' => 4545)
);

$options = array(
    'http' => array(
        'header'  => "Content-type: application/json\r\nAccept: application/json\r\n",
        'method'  => 'POST',
        'content' => json_encode($data),
        'ignore_errors' => true
    )
);
$context  = stream_context_create($options);
$result = file_get_contents($url, false, $context);

echo "Response from API:\n";
echo $result;
