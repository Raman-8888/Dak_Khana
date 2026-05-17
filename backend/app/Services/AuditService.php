<?php

namespace App\Services;

use App\Models\AuditLog;

class AuditService
{
    public function log(string $action, $causer, array $metadata = []): void
    {
        $userId = null;
        if (is_object($causer) && isset($causer->id) && is_numeric($causer->id)) {
            $userId = (int) $causer->id;
        }

        AuditLog::create([
            'user_id'  => $userId,
            'action'   => $action,
            'metadata' => empty($metadata) ? null : $metadata,
        ]);
    }
}
