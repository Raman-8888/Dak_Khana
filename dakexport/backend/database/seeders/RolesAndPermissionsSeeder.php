<?php

namespace Database\Seeders;

use App\Models\DeliveryAssignment;
use App\Models\ExportRequest;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class RolesAndPermissionsSeeder extends Seeder
{
    public function run(): void
    {
        $password = Hash::make('Password123!');

        User::query()->firstOrCreate(
            ['email' => 'super@dakexport.local'],
            [
                'name'     => 'Super Admin',
                'password' => $password,
                'role'     => 'super_admin',
                'phone'    => '+910000000001',
            ]
        );

        User::query()->firstOrCreate(
            ['email' => 'admin@dakexport.local'],
            [
                'name'     => 'Operations Admin',
                'password' => $password,
                'role'     => 'admin',
                'phone'    => '+910000000002',
            ]
        );

        User::query()->firstOrCreate(
            ['email' => 'ops@dakexport.local'],
            [
                'name'     => 'Ops Executive',
                'password' => $password,
                'role'     => 'operations_executive',
                'phone'    => '+910000000003',
            ]
        );

        User::query()->firstOrCreate(
            ['email' => 'warehouse@dakexport.local'],
            [
                'name'     => 'Warehouse Lead',
                'password' => $password,
                'role'     => 'warehouse_manager',
                'phone'    => '+910000000004',
            ]
        );

        $agent = User::query()->firstOrCreate(
            ['email' => 'agent@dakexport.local'],
            [
                'name'     => 'Field Agent',
                'password' => $password,
                'role'     => 'delivery_agent',
                'phone'    => '+910000000005',
            ]
        );

        $customer = User::query()->firstOrCreate(
            ['email' => 'customer@dakexport.local'],
            [
                'name'     => 'Demo Customer',
                'password' => $password,
                'role'     => 'customer',
                'phone'    => '+910000000006',
            ]
        );

        if (ExportRequest::query()->where('customer_id', $customer->id)->doesntExist()) {
            $export = ExportRequest::create([
                'customer_id'     => $customer->id,
                'service_type_id' => '00000000-0000-0000-0000-000000000001',
                'status'          => 'processing',
                'is_priority'     => false,
            ]);

            $export->senderDetail()->create([
                'name'         => 'Demo Customer',
                'company_name' => null,
                'address'      => '221B Baker Street',
                'city'         => 'Mumbai',
                'state'        => 'MH',
                'postal_code'  => '400001',
                'phone'        => '+910000000006',
                'email'        => 'customer@dakexport.local',
            ]);

            $export->receiverDetail()->create([
                'name'          => 'Jane Receiver',
                'company_name'  => null,
                'address'       => '350 Fifth Avenue',
                'city'          => 'New York',
                'state'         => 'NY',
                'postal_code'   => '10118',
                'country_code'  => 'US',
                'phone'         => '+12125550123',
                'email'         => null,
            ]);

            $export->packageDetail()->create([
                'weight_grams'         => 2500,
                'content_description' => 'Documents & samples',
                'declared_value'       => 15000,
                'currency'             => 'INR',
            ]);

            $export->trackingEvents()->create([
                'status'   => 'processing',
                'location' => 'Origin hub',
                'notes'    => 'Demo seed shipment ready for pickup.',
            ]);

            DeliveryAssignment::create([
                'shipment_id' => $export->id,
                'agent_id'    => $agent->id,
                'status'      => 'assigned',
                'assigned_at' => now(),
            ]);
        }
    }
}
