import React from 'react';
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import App from '../App';
import Chat from '../components/Chat';
import Email from '../components/Email';
import Activity from '../components/History';
import Settings from '../components/Settings';
import UserGuide from '../components/UserGuide';
import Auth from '../components/Auth';
import RequireAuth from './RequireAuth';

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <RequireAuth>
        <App />
      </RequireAuth>
    ),
    children: [
      { index: true, element: <Navigate to="/chat" replace /> },
      { path: 'chat', element: <Chat /> },
      { path: 'email', element: <Email /> },
      { path: 'activity', element: <Activity /> },
      { path: 'settings', element: <Settings /> },
      { path: 'guide', element: <UserGuide /> },
    ],
  },
  { path: '/login', element: <Auth /> },
]);

const AppRouter: React.FC = () => {
  return <RouterProvider router={router} />;
};

export default AppRouter;


