<?php

namespace App\Services;

/**
 * MongoDB Atlas helper. Enable PHP ext-mongodb, then `composer require mongodb/mongodb`.
 *
 * Eloquent models in this app still use SQL; use this service for document data or
 * a gradual move of specific workloads to Atlas.
 */
class MongoService
{
    public function isConfigured(): bool
    {
        return (bool) config('services.mongodb.uri');
    }

    public function isExtensionLoaded(): bool
    {
        return extension_loaded('mongodb');
    }

    public function libraryAvailable(): bool
    {
        return class_exists(\MongoDB\Client::class);
    }

    /**
     * @return \MongoDB\Client|null
     */
    public function client()
    {
        if (! $this->isConfigured() || ! $this->isExtensionLoaded() || ! $this->libraryAvailable()) {
            return null;
        }

        try {
            return new \MongoDB\Client(config('services.mongodb.uri'));
        } catch (\Throwable $e) {
            report($e);

            return null;
        }
    }

    /**
     * @return \MongoDB\Database|null
     */
    public function database(?string $name = null)
    {
        $client = $this->client();
        if (! $client) {
            return null;
        }

        return $client->selectDatabase($name ?? config('services.mongodb.database', 'dakexport'));
    }

    public function ping(): bool
    {
        $db = $this->database();
        if (! $db) {
            return false;
        }

        try {
            $db->command(['ping' => 1]);

            return true;
        } catch (\Throwable) {
            return false;
        }
    }
}
