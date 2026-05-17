<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'token' => env('POSTMARK_TOKEN'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    /*
    | MongoDB Atlas — document / cloud data (requires PHP ext-mongodb).
    | Never commit real URIs; keep MONGODB_URI in .env only.
    | Passwords with @ # etc. must be URL-encoded in the URI.
    */
    'mongodb' => [
        'uri'      => env('MONGODB_URI'),
        'database' => env('MONGODB_DATABASE', 'dakexport'),
    ],

    /*
    | Supabase — Storage (PDFs, POD images). Server-side uploads must use
    | SUPABASE_SERVICE_ROLE_KEY only (never ship this to the frontend).
    */
    'supabase' => [
        'url'              => rtrim((string) env('SUPABASE_URL'), '/'),
        'anon_key'         => env('SUPABASE_ANON_KEY'),
        'service_role_key' => env('SUPABASE_SERVICE_ROLE_KEY'),
        'storage_bucket'   => env('SUPABASE_STORAGE_BUCKET', 'exports'),
    ],

];
