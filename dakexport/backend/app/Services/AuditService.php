<?php

namespace App\Services;

class AuditService
{
    /**
     * Log activity within the system.
     * 
     * @param string $action
     * @param mixed $causer
     * @param array $metadata
     * @return void
     */
    public function log($action, $causer, $metadata = [])
    {
        // Placeholder for activity logging logic
    }
}
