<?php

namespace App\Repositories\Contracts;

interface ExportRequestRepositoryInterface
{
    public function all();
    public function find($id);
    public function create(array $data);
}
