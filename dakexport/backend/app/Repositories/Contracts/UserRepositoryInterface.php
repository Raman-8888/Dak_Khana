<?php

namespace App\Repositories\Contracts;

interface UserRepositoryInterface
{
    public function all();
    public function find($id);
}
