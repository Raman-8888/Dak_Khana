/**
 * Admin / super_admin can switch workspaces to preview each operational area (same token, full API access).
 */
export const ADMIN_WORKSPACES = [
    { id: 'admin',              label: 'Admin',                 path: '/admin/dashboard',   icon: '🛡️' },
    { id: 'operations_executive', label: 'Operations Executive', path: '/ops/dashboard',     icon: '📡' },
    { id: 'warehouse_manager',  label: 'Warehouse Manager',    path: '/warehouse/dashboard', icon: '📦' },
    { id: 'support_agent',      label: 'Support Agent',        path: '/support/dashboard',   icon: '💬' },
    { id: 'finance',            label: 'Finance Team',         path: '/finance/dashboard',   icon: '💳' },
    { id: 'regional_manager',   label: 'Regional Manager',     path: '/regional/dashboard',  icon: '🗺️' },
];

export const DEFAULT_ADMIN_WORKSPACE = 'admin';
