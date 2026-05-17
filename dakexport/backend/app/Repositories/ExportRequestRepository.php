<?php

namespace App\Repositories;

use App\Models\ExportRequest;
use App\Repositories\Contracts\ExportRequestRepositoryInterface;

class ExportRequestRepository implements ExportRequestRepositoryInterface
{
    public function all()
    {
        return ExportRequest::all();
    }

    public function find($id)
    {
        return ExportRequest::findOrFail($id);
    }

    public function create(array $data)
    {
        return ExportRequest::create($data);
    }
}
