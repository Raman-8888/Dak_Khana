import { createBrowserRouter, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/auth/ProtectedRoute';

// ── Public pages ──────────────────────────────────────────────────────────────
import HomePage       from './pages/public/HomePage';
import TrackShipment  from './pages/public/TrackShipment';
import Unauthorized   from './pages/public/Unauthorized';

// ── Auth ──────────────────────────────────────────────────────────────────────
import Login    from './pages/auth/Login';
import Register from './pages/auth/Register';

// ── Customer ──────────────────────────────────────────────────────────────────
import CustomerDashboard from './pages/customer/Dashboard';
import LogisticsPage     from './pages/customer/LogisticsPage';

// ── Delivery Agent ────────────────────────────────────────────────────────────
import AgentDashboard from './pages/agent/AgentDashboard';
import AgentAssignments from './pages/agent/AgentAssignments';

// ── Admin ─────────────────────────────────────────────────────────────────────
import AdminDashboard from './pages/admin/Dashboard';
import AdminWorkspaceBar from './components/admin/AdminWorkspaceBar';

// ─────────────────────────────────────────────────────────────────────────────
// Convenience wrappers for role guards
// ─────────────────────────────────────────────────────────────────────────────
const CustomerGuard = ({ children }) => (
    <ProtectedRoute roles={['customer']}>{children}</ProtectedRoute>
);

const AgentGuard = ({ children }) => (
    <ProtectedRoute roles={['delivery_agent']}>{children}</ProtectedRoute>
);

const OpsGuard = ({ children }) => (
    <ProtectedRoute roles={['operations_executive', 'admin', 'super_admin']}>{children}</ProtectedRoute>
);

const WarehouseGuard = ({ children }) => (
    <ProtectedRoute roles={['warehouse_manager', 'admin', 'super_admin']}>{children}</ProtectedRoute>
);

const FinanceGuard = ({ children }) => (
    <ProtectedRoute roles={['finance', 'admin', 'super_admin']}>{children}</ProtectedRoute>
);

const SupportGuard = ({ children }) => (
    <ProtectedRoute roles={['support_agent', 'admin', 'super_admin']}>{children}</ProtectedRoute>
);

const RegionalGuard = ({ children }) => (
    <ProtectedRoute roles={['regional_manager', 'admin', 'super_admin']}>{children}</ProtectedRoute>
);

const AdminGuard = ({ children }) => (
    <ProtectedRoute roles={['admin', 'super_admin']}>{children}</ProtectedRoute>
);

// ─────────────────────────────────────────────────────────────────────────────
// Lazy placeholder component until real pages are built
// ─────────────────────────────────────────────────────────────────────────────
const ComingSoon = ({ title }) => (
    <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minHeight: '100vh', background: '#0f172a', flexDirection: 'column',
        gap: '16px', fontFamily: 'Inter, sans-serif', color: '#94a3b8',
        padding: '24px',
        paddingBottom: '100px',
    }}>
        <div style={{ fontSize: '2.5rem' }}>🚧</div>
        <h2 style={{ color: '#f1f5f9', margin: 0 }}>{title}</h2>
        <p style={{ margin: 0, fontSize: '0.9rem' }}>This module is under construction — coming soon.</p>
        <AdminWorkspaceBar variant="floating" />
    </div>
);

// ─────────────────────────────────────────────────────────────────────────────
export const router = createBrowserRouter([

    // ── Public ─────────────────────────────────────────────────────────────
    { path: '/',             element: <HomePage /> },
    { path: '/track',        element: <TrackShipment /> },
    { path: '/unauthorized', element: <Unauthorized /> },

    // ── Auth ───────────────────────────────────────────────────────────────
    { path: '/login',    element: <Login /> },
    { path: '/register', element: <Register /> },

    // ── Customer ───────────────────────────────────────────────────────────
    {
        path: '/customer',
        children: [
            { index: true, element: <Navigate to="dashboard" replace /> },
            { path: 'dashboard', element: <CustomerGuard><CustomerDashboard /></CustomerGuard> },
            { path: 'create-shipment', element: <CustomerGuard><LogisticsPage /></CustomerGuard> },
            { path: 'my-shipments',    element: <CustomerGuard><ComingSoon title="My Shipments" /></CustomerGuard> },
            { path: 'documents',       element: <CustomerGuard><ComingSoon title="My Documents" /></CustomerGuard> },
            { path: 'billing',         element: <CustomerGuard><ComingSoon title="Billing & Payments" /></CustomerGuard> },
            { path: 'support',         element: <CustomerGuard><ComingSoon title="Support Tickets" /></CustomerGuard> },
            { path: 'track',           element: <CustomerGuard><TrackShipment /></CustomerGuard> },
        ],
    },

    // ── Delivery Agent ─────────────────────────────────────────────────────
    {
        path: '/agent',
        children: [
            { index: true, element: <Navigate to="dashboard" replace /> },
            { path: 'dashboard',   element: <AgentGuard><AgentDashboard /></AgentGuard> },
            { path: 'assignments', element: <AgentGuard><AgentAssignments /></AgentGuard> },
            { path: 'map',         element: <AgentGuard><ComingSoon title="Live Route Map" /></AgentGuard> },
            { path: 'shift',       element: <AgentGuard><ComingSoon title="Shift Management" /></AgentGuard> },
            { path: 'earnings',    element: <AgentGuard><ComingSoon title="Earnings" /></AgentGuard> },
            { path: 'performance', element: <AgentGuard><ComingSoon title="Performance Stats" /></AgentGuard> },
        ],
    },

    // ── Operations Executive (Phase 2) ─────────────────────────────────────
    {
        path: '/ops',
        children: [
            { index: true, element: <Navigate to="dashboard" replace /> },
            { path: 'dashboard',   element: <OpsGuard><ComingSoon title="Operations Dashboard" /></OpsGuard> },
            { path: 'shipments',   element: <OpsGuard><ComingSoon title="All Shipments" /></OpsGuard> },
            { path: 'live-map',    element: <OpsGuard><ComingSoon title="Live Agent Map" /></OpsGuard> },
            { path: 'agents',      element: <OpsGuard><ComingSoon title="Agent Control" /></OpsGuard> },
            { path: 'escalations', element: <OpsGuard><ComingSoon title="Escalation Queue" /></OpsGuard> },
            { path: 'analytics',   element: <OpsGuard><ComingSoon title="Analytics" /></OpsGuard> },
        ],
    },

    // ── Warehouse Manager (Phase 2) ────────────────────────────────────────
    {
        path: '/warehouse',
        children: [
            { index: true, element: <Navigate to="dashboard" replace /> },
            { path: 'dashboard', element: <WarehouseGuard><ComingSoon title="Warehouse Dashboard" /></WarehouseGuard> },
            { path: 'scan',      element: <WarehouseGuard><ComingSoon title="Scan Station" /></WarehouseGuard> },
            { path: 'dispatch',  element: <WarehouseGuard><ComingSoon title="Dispatch Console" /></WarehouseGuard> },
            { path: 'inventory', element: <WarehouseGuard><ComingSoon title="Inventory" /></WarehouseGuard> },
        ],
    },

    // ── Finance ───────────────────────────────────────────────────────────
    {
        path: '/finance',
        children: [
            { index: true, element: <Navigate to="dashboard" replace /> },
            { path: 'dashboard', element: <FinanceGuard><ComingSoon title="Finance Dashboard" /></FinanceGuard> },
            { path: 'reconciliation', element: <FinanceGuard><ComingSoon title="Payment Reconciliation" /></FinanceGuard> },
            { path: 'payouts', element: <FinanceGuard><ComingSoon title="Agent Payouts" /></FinanceGuard> },
        ],
    },

    // ── Support ─────────────────────────────────────────────────────────────
    {
        path: '/support',
        children: [
            { index: true, element: <Navigate to="dashboard" replace /> },
            { path: 'dashboard', element: <SupportGuard><ComingSoon title="Support Dashboard" /></SupportGuard> },
            { path: 'tickets', element: <SupportGuard><ComingSoon title="Tickets" /></SupportGuard> },
        ],
    },

    // ── Regional ───────────────────────────────────────────────────────────
    {
        path: '/regional',
        children: [
            { index: true, element: <Navigate to="dashboard" replace /> },
            { path: 'dashboard', element: <RegionalGuard><ComingSoon title="Regional Dashboard" /></RegionalGuard> },
            { path: 'analytics', element: <RegionalGuard><ComingSoon title="Regional Analytics" /></RegionalGuard> },
        ],
    },

    // ── Admin ──────────────────────────────────────────────────────────────
    {
        path: '/admin',
        children: [
            { index: true, element: <Navigate to="dashboard" replace /> },
            { path: 'dashboard',   element: <AdminGuard><AdminDashboard /></AdminGuard> },
            { path: 'users',       element: <AdminGuard><ComingSoon title="User Management" /></AdminGuard> },
            { path: 'roles',       element: <AdminGuard><ComingSoon title="Role Permissions" /></AdminGuard> },
            { path: 'pricing',     element: <AdminGuard><ComingSoon title="Pricing Rules" /></AdminGuard> },
            { path: 'zones',       element: <AdminGuard><ComingSoon title="Country Zones" /></AdminGuard> },
            { path: 'audit-logs',  element: <AdminGuard><ComingSoon title="Audit Logs" /></AdminGuard> },
            { path: 'system',      element: <AdminGuard><ComingSoon title="System Health" /></AdminGuard> },
        ],
    },

    // ── Logistics (legacy redirect) ────────────────────────────────────────
    { path: '/logistics', element: <Navigate to="/customer/create-shipment" replace /> },

    // ── 404 ────────────────────────────────────────────────────────────────
    {
        path: '*',
        element: (
            <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                minHeight: '100vh', background: '#0f172a', flexDirection: 'column',
                gap: '16px', fontFamily: 'Inter, sans-serif', color: '#94a3b8',
            }}>
                <div style={{ fontSize: '2.5rem' }}>🌐</div>
                <h2 style={{ color: '#f1f5f9', margin: 0 }}>404 — Page Not Found</h2>
                <a href="/" style={{ color: '#45DB70', textDecoration: 'none', fontSize: '0.9rem' }}>
                    Return to Home
                </a>
            </div>
        ),
    },
]);
