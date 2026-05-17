<?php
$sql = file_get_contents(base_path('../supabase_schema.sql'));
if (!$sql) {
    $sql = file_get_contents('C:/Users/raman/.gemini/antigravity/brain/11356e88-c313-4104-a0a3-2fda41d5c8af/artifacts/supabase_schema.sql');
}
try {
    DB::unprepared($sql);
    echo "Schema executed successfully.\n";
} catch (\Exception $e) {
    echo "Error executing schema: " . $e->getMessage() . "\n";
}
