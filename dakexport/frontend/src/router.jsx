import { createBrowserRouter } from 'react-router-dom';
import HomePage from './pages/public/HomePage';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import CustomerDashboard from './pages/customer/Dashboard';
import AdminDashboard from './pages/admin/Dashboard';
import TrackShipment from './pages/public/TrackShipment';

export const router = createBrowserRouter([
    {
        path: '/',
        element: <HomePage />,
    },
    {
        path: '/track',
        element: <TrackShipment />,
    },
    {
        path: '/login',
        element: <Login />,
    },
    {
        path: '/register',
        element: <Register />,
    },
    {
        path: '/customer',
        children: [
            { path: 'dashboard', element: <CustomerDashboard /> },
        ],
    },
    {
        path: '/admin',
        children: [
            { path: 'dashboard', element: <AdminDashboard /> },
        ],
    },
]);
