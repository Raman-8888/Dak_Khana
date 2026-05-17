<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;

class NotificationService
{
    public function notify($user, string $message): void
    {
        Log::info('notification', [
            'user_id' => is_object($user) && isset($user->id) ? $user->id : null,
            'message' => $message,
        ]);
    }
}
