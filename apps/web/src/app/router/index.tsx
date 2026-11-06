import { createBrowserRouter, Navigate } from 'react-router-dom';
import { FuneralHomeLayout } from '@/layouts/FuneralHomeLayout/FuneralHomeLayout';
import { CaseListPage } from '@/modules/cases/pages/CaseListPage';

export const router = createBrowserRouter([
    {
        path: '/',
        element: <Navigate to="/app" replace />,
    },
    {
        path: '/app',
        element: <FuneralHomeLayout />,
        children: [
            { index: true, element: <Navigate to="/app/cases" replace /> },
            { path: 'cases', element: <CaseListPage /> },
        ],
    },
    {
        path: '*',
        element: <Navigate to="/app" replace />,
    },
]);