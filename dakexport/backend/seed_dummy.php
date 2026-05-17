<?php
use Illuminate\Support\Facades\DB;

try {
    DB::unprepared("
        INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token) 
        VALUES ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'test@example.com', '', now(), now(), now(), '{\"provider\":\"email\",\"providers\":[\"email\"]}', '{}', now(), now(), '', '', '', '') ON CONFLICT DO NOTHING;
        
        INSERT INTO public.profiles (id, role, first_name, last_name, phone, address, city, state, postal_code) 
        VALUES ('00000000-0000-0000-0000-000000000000', 'customer', 'Test', 'Customer', '1234567890', '123 Test St', 'Mumbai', 'MH', '400001') ON CONFLICT DO NOTHING;
        
        INSERT INTO public.service_types (id, name, description) 
        VALUES ('00000000-0000-0000-0000-000000000000', 'Speed Post International', 'Fastest delivery') ON CONFLICT DO NOTHING;
    ");
    echo "Successfully seeded dummy data.\n";
} catch (\Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
