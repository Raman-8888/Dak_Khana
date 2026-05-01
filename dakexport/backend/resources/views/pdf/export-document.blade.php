<!DOCTYPE html>
<html>
<head>
    <title>Export Document</title>
    <style>
        body { font-family: sans-serif; }
        .header { text-align: center; margin-bottom: 20px; }
        .content { margin: 0 50px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Export Document #{{ $id }}</h1>
    </div>
    <div class="content">
        <p><strong>Customer:</strong> {{ $customer_name }}</p>
        <p><strong>Weight:</strong> {{ $weight }} kg</p>
        <p><strong>Destination:</strong> {{ $destination }}</p>
    </div>
</body>
</html>
