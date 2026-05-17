<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasFactory, Notifiable, HasApiTokens;

    // ── Valid Role Slugs ──────────────────────────────────
    const ROLES = [
        'customer',
        'delivery_agent',
        'operations_executive',
        'warehouse_manager',
        'finance',
        'compliance_officer',
        'support_agent',
        'regional_manager',
        'admin',
        'super_admin',
    ];

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'is_active',
        'phone',
        'avatar',
        'employee_id',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password'          => 'hashed',
            'is_active'         => 'boolean',
        ];
    }

    // ── Role Helpers ──────────────────────────────────────

    public function isAdmin(): bool
    {
        return in_array($this->role, ['admin', 'super_admin']);
    }

    public function isSuperAdmin(): bool
    {
        return $this->role === 'super_admin';
    }

    public function isAgent(): bool
    {
        return $this->role === 'delivery_agent';
    }

    public function isCustomer(): bool
    {
        return $this->role === 'customer';
    }

    public function isOpsExec(): bool
    {
        return $this->role === 'operations_executive';
    }

    public function isWarehouse(): bool
    {
        return $this->role === 'warehouse_manager';
    }

    public function isFinance(): bool
    {
        return $this->role === 'finance';
    }

    public function isCompliance(): bool
    {
        return $this->role === 'compliance_officer';
    }

    public function hasRole(string|array $roles): bool
    {
        $roles = (array) $roles;
        return in_array($this->role, $roles);
    }

    // ── Relationships ─────────────────────────────────────

    public function exportRequests()
    {
        return $this->hasMany(ExportRequest::class, 'customer_id');
    }

    /** Deliveries assigned to this agent */
    public function deliveryAssignments()
    {
        return $this->hasMany(DeliveryAssignment::class, 'agent_id');
    }

    /** Shift records for this agent */
    public function agentShifts()
    {
        return $this->hasMany(AgentShift::class, 'agent_id');
    }

    /** GPS location pings for this agent */
    public function agentLocations()
    {
        return $this->hasMany(AgentLocation::class, 'agent_id');
    }

    /** Earnings records for this agent */
    public function agentEarnings()
    {
        return $this->hasMany(AgentEarning::class, 'agent_id');
    }
}
